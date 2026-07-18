import type { APIRoute } from 'astro';
import { deliverMessage, type ContactEnvironment } from '../../lib/contact-adapter';
import { json, text, validateEmail } from '../../lib/form-validation';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const form = await request.formData();
  const locale = text(form, 'locale', 2) || 'fr';
  const french = locale === 'fr';
  if (text(form, 'website', 200)) return json('Merci pour votre inscription.', 200);
  const email = text(form, 'email', 254);
  if (!validateEmail(email) || text(form, 'consent', 10) !== 'yes') {
    return json(
      french
        ? 'Vérifiez votre adresse e-mail et le consentement.'
        : 'Check your email address and consent.',
      400,
    );
  }
  const runtime = (locals as unknown as { runtime?: { env?: ContactEnvironment } }).runtime;
  const result = await deliverMessage(
    { kind: 'newsletter', locale, submittedAt: new Date().toISOString(), fields: { email } },
    runtime?.env ?? {},
  );
  if (!result.delivered) {
    return json(
      french
        ? 'Le formulaire est prêt, mais le service de newsletter n’est pas encore connecté.'
        : 'The form is ready, but the newsletter provider is not connected yet.',
      503,
    );
  }
  return json(
    french
      ? 'Merci, votre inscription est enregistrée.'
      : 'Thank you, your subscription is confirmed.',
    200,
  );
};
