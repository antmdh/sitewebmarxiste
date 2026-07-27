import type { APIRoute } from 'astro';
import { json, text, validateEmail } from '../../lib/form-validation';
import {
  normalizeNewsletterEmail,
  storeNewsletterSubscription,
  type NewsletterEnvironment,
  verifyNewsletterTurnstile,
} from '../../lib/newsletter-store';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const contentLength = Number(request.headers.get('content-length') || '0');
  const contentType = request.headers.get('content-type') || '';
  if (
    (Number.isFinite(contentLength) && contentLength > 8_192) ||
    (!contentType.includes('application/x-www-form-urlencoded') &&
      !contentType.includes('multipart/form-data'))
  ) {
    return json('Invalid request.', 400);
  }

  const requestUrl = new URL(request.url);
  const origin = request.headers.get('origin');
  if (origin && origin !== requestUrl.origin) return json('Invalid request.', 403);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json('Invalid request.', 400);
  }
  const requestedLocale = text(form, 'locale', 2);
  const locale = ['fr', 'en', 'es', 'de', 'nl', 'it'].includes(requestedLocale)
    ? requestedLocale
    : 'en';
  const translations: Record<
    string,
    {
      fast: string;
      invalid: string;
      limited: string;
      received: string;
      unavailable: string;
      success: string;
    }
  > = {
    fr: {
      received: 'Merci pour votre inscription.',
      fast: 'Le formulaire a été envoyé trop rapidement.',
      invalid: 'Vérifiez votre adresse e-mail et le consentement.',
      limited: 'Trop de tentatives ont été effectuées. Réessayez dans une minute.',
      unavailable: 'Le service d’inscription est temporairement indisponible.',
      success: 'Merci, votre demande d’inscription est enregistrée.',
    },
    en: {
      received: 'Thank you for subscribing.',
      fast: 'The form was submitted too quickly.',
      invalid: 'Check your email address and consent.',
      limited: 'Too many attempts were made. Please try again in one minute.',
      unavailable: 'The subscription service is temporarily unavailable.',
      success: 'Thank you, your subscription request has been recorded.',
    },
    es: {
      received: 'Gracias por suscribirte.',
      fast: 'El formulario se ha enviado demasiado rápido.',
      invalid: 'Comprueba tu correo electrónico y tu consentimiento.',
      limited: 'Se han realizado demasiados intentos. Vuelve a intentarlo en un minuto.',
      unavailable: 'El servicio de suscripción no está disponible temporalmente.',
      success: 'Gracias, tu solicitud de suscripción ha sido registrada.',
    },
    de: {
      received: 'Vielen Dank für deine Anmeldung.',
      fast: 'Das Formular wurde zu schnell abgeschickt.',
      invalid: 'Überprüfe deine E-Mail-Adresse und deine Einwilligung.',
      limited: 'Zu viele Versuche. Bitte versuche es in einer Minute erneut.',
      unavailable: 'Der Anmeldedienst ist vorübergehend nicht verfügbar.',
      success: 'Danke, deine Anmeldung wurde erfasst.',
    },
    nl: {
      received: 'Bedankt voor je inschrijving.',
      fast: 'Het formulier is te snel verzonden.',
      invalid: 'Controleer je e-mailadres en toestemming.',
      limited: 'Er zijn te veel pogingen gedaan. Probeer het over een minuut opnieuw.',
      unavailable: 'De inschrijfservice is tijdelijk niet beschikbaar.',
      success: 'Bedankt, je inschrijvingsverzoek is opgeslagen.',
    },
    it: {
      received: 'Grazie per l’iscrizione.',
      fast: 'Il modulo è stato inviato troppo rapidamente.',
      invalid: 'Controlla il tuo indirizzo e-mail e il consenso.',
      limited: 'Sono stati effettuati troppi tentativi. Riprova tra un minuto.',
      unavailable: 'Il servizio di iscrizione è temporaneamente non disponibile.',
      success: 'Grazie, la tua richiesta di iscrizione è stata registrata.',
    },
  };
  const messages = translations[locale] ?? translations.en;
  if (text(form, 'website', 200)) return json(messages.received, 200);

  const startedAt = Number(text(form, 'formStartedAt', 20));
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < 1_200) {
    return json(messages.fast, 400);
  }

  const runtime = (locals as unknown as { runtime?: { env?: NewsletterEnvironment } }).runtime;
  const env = runtime?.env ?? {};
  const remoteIp = request.headers.get('CF-Connecting-IP') || undefined;
  if (env.NEWSLETTER_RATE_LIMITER) {
    const rateLimit = await env.NEWSLETTER_RATE_LIMITER.limit({
      key: remoteIp || 'unknown-client',
    });
    if (!rateLimit.success) return json(messages.limited, 429);
  }

  const email = normalizeNewsletterEmail(text(form, 'email', 254));
  if (!validateEmail(email) || text(form, 'consent', 10) !== 'yes') {
    return json(messages.invalid, 400);
  }

  if (!env.TURNSTILE_SECRET_KEY) return json(messages.unavailable, 503);
  const turnstileIsValid = await verifyNewsletterTurnstile(
    text(form, 'cf-turnstile-response', 2_048),
    env.TURNSTILE_SECRET_KEY,
    remoteIp,
  );
  if (!turnstileIsValid) return json(messages.invalid, 400);

  const result = await storeNewsletterSubscription(
    { email, locale, submittedAt: new Date().toISOString() },
    env,
  );
  if (!result.stored) return json(messages.unavailable, 503);
  return json(messages.success, 200);
};
