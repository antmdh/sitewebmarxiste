import type { APIRoute } from 'astro';
import { deliverMessage, type ContactEnvironment } from '../../lib/contact-adapter';
import { json, text, validateEmail } from '../../lib/form-validation';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const form = await request.formData();
  const locale = text(form, 'locale', 2) || 'fr';
  const translations: Record<
    string,
    { received: string; fast: string; invalid: string; unavailable: string; success: string }
  > = {
    fr: {
      received: 'Merci, votre demande a bien été reçue.',
      fast: 'Le formulaire a été envoyé trop rapidement.',
      invalid: 'Vérifiez les champs obligatoires et votre adresse e-mail.',
      unavailable:
        'Le formulaire fonctionne, mais le service d’e-mail n’est pas encore configuré. Écrivez-nous directement à marxismepourdebutant@gmail.com.',
      success: 'Merci. Votre demande a bien été envoyée.',
    },
    en: {
      received: 'Thank you, your request has been received.',
      fast: 'The form was submitted too quickly.',
      invalid: 'Check the required fields and your email address.',
      unavailable:
        'The form works, but the email service is not configured yet. Please write to marxismepourdebutant@gmail.com.',
      success: 'Thank you. Your request has been sent.',
    },
    nl: {
      received: 'Bedankt, je aanvraag is ontvangen.',
      fast: 'Het formulier is te snel verzonden.',
      invalid: 'Controleer de verplichte velden en je e-mailadres.',
      unavailable:
        'Het formulier werkt, maar de e-maildienst is nog niet ingesteld. Schrijf rechtstreeks naar marxismepourdebutant@gmail.com.',
      success: 'Bedankt. Je aanvraag is verzonden.',
    },
    it: {
      received: 'Grazie, la tua richiesta è stata ricevuta.',
      fast: 'Il modulo è stato inviato troppo rapidamente.',
      invalid: 'Controlla i campi obbligatori e il tuo indirizzo e-mail.',
      unavailable:
        'Il modulo funziona, ma il servizio e-mail non è ancora configurato. Scrivi direttamente a marxismepourdebutant@gmail.com.',
      success: 'Grazie. La tua richiesta è stata inviata.',
    },
  };
  const messages = translations[locale] ?? translations.en;

  if (text(form, 'website', 200)) return json(messages.received, 200);

  const startedAt = Number(text(form, 'formStartedAt', 20));
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < 1_200) {
    return json(messages.fast, 400);
  }

  const name = text(form, 'name', 120);
  const email = text(form, 'email', 254);
  const description = text(form, 'description', 8_000);
  const consent = text(form, 'consent', 10);
  if (name.length < 2 || !validateEmail(email) || description.length < 30 || consent !== 'yes') {
    return json(messages.invalid, 400);
  }

  const runtime = (locals as unknown as { runtime?: { env?: ContactEnvironment } }).runtime;
  const result = await deliverMessage(
    {
      kind: 'contact',
      locale,
      submittedAt: new Date().toISOString(),
      fields: {
        name,
        email,
        description,
        organization: text(form, 'organization', 200),
        projectType: text(form, 'projectType', 80),
        audience: text(form, 'audience', 200),
        platform: text(form, 'platform', 80),
        budget: text(form, 'budget', 80),
        timeline: text(form, 'timeline', 160),
      },
    },
    runtime?.env ?? {},
  );

  if (!result.delivered) {
    return json(messages.unavailable, 503);
  }
  return json(messages.success, 200);
};
