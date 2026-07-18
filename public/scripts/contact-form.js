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
    status.textContent = document.documentElement.lang === 'fr' ? 'Envoi en cours…' : 'Sending…';
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
      status.textContent =
        document.documentElement.lang === 'fr'
          ? 'Impossible de contacter le serveur. Réessayez plus tard.'
          : 'The server could not be reached. Please try again later.';
    } finally {
      button.disabled = false;
    }
  });
});
