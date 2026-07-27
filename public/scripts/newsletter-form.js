document.querySelectorAll('[data-newsletter-form]').forEach((form) => {
  const startedAt = form.querySelector('input[name="formStartedAt"]');
  if (startedAt) startedAt.value = String(Date.now());

  form.addEventListener('submit', async (event) => {
    if (!form.checkValidity()) return;
    event.preventDefault();

    const status = form.querySelector('[data-newsletter-status]');
    const button = form.querySelector('button[type="submit"]');
    if (!status || !button) return;

    const language = document.documentElement.lang;
    const messages = {
      fr: {
        sending: 'Inscription en cours…',
        error: 'Impossible de contacter le serveur. Réessayez plus tard.',
      },
      en: {
        sending: 'Subscribing…',
        error: 'The server could not be reached. Please try again later.',
      },
      es: {
        sending: 'Suscripción en curso…',
        error: 'No se ha podido contactar con el servidor. Inténtalo más tarde.',
      },
      de: {
        sending: 'Anmeldung läuft…',
        error: 'Der Server ist nicht erreichbar. Bitte versuche es später erneut.',
      },
      nl: {
        sending: 'Bezig met inschrijven…',
        error: 'De server is niet bereikbaar. Probeer het later opnieuw.',
      },
      it: {
        sending: 'Iscrizione in corso…',
        error: 'Impossibile contattare il server. Riprova più tardi.',
      },
    };
    const copy = messages[language] ?? messages.en;
    button.disabled = true;
    status.textContent = copy.sending;

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      const payload = await response.json();
      status.textContent = payload.message ?? copy.error;
      if (response.ok) {
        form.reset();
        if (startedAt) startedAt.value = String(Date.now());
      }
    } catch {
      status.textContent = copy.error;
    } finally {
      const widget = form.querySelector('.cf-turnstile');
      if (widget && window.turnstile) window.turnstile.reset(widget);
      button.disabled = false;
    }
  });
});
