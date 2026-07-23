const form = document.querySelector('[data-case-study-auth]');
const passwordInput = form?.querySelector('[name="password"]');
const submitButton = form?.querySelector('button[type="submit"]');
const errorMessage = document.querySelector('[data-case-study-auth-error]');
const allowedTargets = new Set([
  '/work/orange-rockland',
  '/work/orange-rockland/index.html',
  '/work/aca-group',
  '/work/aca-group/index.html',
  '/work/national-grid',
  '/work/national-grid/index.html',
  '/work/delta-dental-california',
  '/work/delta-dental-california/index.html',
]);

function getTarget() {
  const target = new URLSearchParams(window.location.search).get('next');
  return allowedTargets.has(target) ? target : '/work/orange-rockland';
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorMessage.textContent = '';
  form.setAttribute('aria-busy', 'true');
  submitButton.disabled = true;

  try {
    const response = await fetch('/api/case-study-auth', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: passwordInput.value,
        next: getTarget(),
      }),
    });
    const payload = await response.json();

    if (!response.ok || !payload.ok) {
      throw new Error(payload.message || 'Unable to verify that password.');
    }

    window.location.assign(payload.next);
  } catch (error) {
    errorMessage.textContent = error.message;
    passwordInput.select();
    submitButton.disabled = false;
    form.setAttribute('aria-busy', 'false');
  }
});
