import type { APIRoute } from 'astro';
import { deliverMessage, type ContactEnvironment } from '../../lib/contact-adapter';
import { json, text, validateEmail } from '../../lib/form-validation';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const form = await request.formData();
  const locale = text(form, 'locale', 2) || 'fr';
  const french = locale === 'fr';

  if (text(form, 'website', 200)) return json('Merci, votre demande a bien été reçue.', 200);

  const startedAt = Number(text(form, 'formStartedAt', 20));
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < 1_200) {
    return json(
      french
        ? 'Le formulaire a été envoyé trop rapidement.'
        : 'The form was submitted too quickly.',
      400,
    );
  }

  const name = text(form, 'name', 120);
  const email = text(form, 'email', 254);
  const description = text(form, 'description', 8_000);
  const consent = text(form, 'consent', 10);
  if (name.length < 2 || !validateEmail(email) || description.length < 30 || consent !== 'yes') {
    return json(
      french
        ? 'Vérifiez les champs obligatoires et votre adresse e-mail.'
        : 'Check the required fields and your email address.',
      400,
    );
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
    return json(
      french
        ? 'Le formulaire fonctionne, mais le service d’e-mail n’est pas encore configuré. Écrivez-nous directement à marxismepourdebutant@gmail.com.'
        : 'The form works, but the email service is not configured yet. Please write to marxismepourdebutant@gmail.com.',
      503,
    );
  }
  return json(
    french ? 'Merci. Votre demande a bien été envoyée.' : 'Thank you. Your request has been sent.',
    200,
  );
};
