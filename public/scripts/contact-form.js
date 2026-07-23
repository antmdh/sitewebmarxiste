document.querySelectorAll('[data-contact-form]').forEach((form) => {
  const startedAt = form.querySelector('input[name="formStartedAt"]');
  if (startedAt) startedAt.value = String(Date.now());

  form.addEventListener('submit', async (event) => {
    if (!form.checkValidity()) return;
    event.preventDefault();
    const status = form.querySelector('[data-form-status]');
    const button = form.querySelector('button[type="submit"]');
    if (!status || !button) return;

    button.disabled = true;
    const language = document.documentElement.lang;
    const messages = {
      fr: {
        sending: 'Envoi en cours…',
        error: 'Impossible de contacter le serveur. Réessayez plus tard.',
      },
      en: {
        sending: 'Sending…',
        error: 'The server could not be reached. Please try again later.',
      },
      nl: {
        sending: 'Bezig met verzenden…',
        error: 'De server is niet bereikbaar. Probeer het later opnieuw.',
      },
      it: {
        sending: 'Invio in corso…',
        error: 'Impossibile contattare il server. Riprova più tardi.',
      },
    };
    const text = messages[language] ?? messages.en;
    status.textContent = text.sending;
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      const payload = await response.json();
      status.textContent = payload.message ?? 'Une erreur est survenue.';
      if (response.ok) form.reset();
    } catch {
      status.textContent = text.error;
    } finally {
      button.disabled = false;
    }
  });
});
