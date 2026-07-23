import type { APIRoute } from 'astro';
import { deliverMessage, type ContactEnvironment } from '../../lib/contact-adapter';
import { json, text, validateEmail } from '../../lib/form-validation';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const form = await request.formData();
  const locale = text(form, 'locale', 2) || 'fr';
  const translations: Record<
    string,
    { received: string; invalid: string; unavailable: string; success: string }
  > = {
    fr: {
      received: 'Merci pour votre inscription.',
      invalid: 'Vérifiez votre adresse e-mail et le consentement.',
      unavailable:
        'Le formulaire est prêt, mais le service de newsletter n’est pas encore connecté.',
      success: 'Merci, votre inscription est enregistrée.',
    },
    en: {
      received: 'Thank you for subscribing.',
      invalid: 'Check your email address and consent.',
      unavailable: 'The form is ready, but the newsletter provider is not connected yet.',
      success: 'Thank you, your subscription is confirmed.',
    },
    nl: {
      received: 'Bedankt voor je inschrijving.',
      invalid: 'Controleer je e-mailadres en toestemming.',
      unavailable: 'Het formulier is klaar, maar de nieuwsbriefdienst is nog niet aangesloten.',
      success: 'Bedankt, je inschrijving is bevestigd.',
    },
    it: {
      received: 'Grazie per l’iscrizione.',
      invalid: 'Controlla il tuo indirizzo e-mail e il consenso.',
      unavailable: 'Il modulo è pronto, ma il servizio newsletter non è ancora collegato.',
      success: 'Grazie, la tua iscrizione è confermata.',
    },
  };
  const messages = translations[locale] ?? translations.en;
  if (text(form, 'website', 200)) return json(messages.received, 200);
  const email = text(form, 'email', 254);
  if (!validateEmail(email) || text(form, 'consent', 10) !== 'yes') {
    return json(messages.invalid, 400);
  }
  const runtime = (locals as unknown as { runtime?: { env?: ContactEnvironment } }).runtime;
  const result = await deliverMessage(
    { kind: 'newsletter', locale, submittedAt: new Date().toISOString(), fields: { email } },
    runtime?.env ?? {},
  );
  if (!result.delivered) {
    return json(messages.unavailable, 503);
  }
  return json(messages.success, 200);
};
