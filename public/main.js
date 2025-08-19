document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('contactForm');
const statusEl = document.getElementById('formStatus');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.textContent = 'Sending...';
  const data = Object.fromEntries(new FormData(form));

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Request failed');
    statusEl.textContent = 'Thanks! Your message has been sent. We will be in contact with you shortly.';
    form.reset();
  } catch (err) {
    statusEl.textContent = 'Oops—could not send. Please try again later, or email us directly.';
  }
});
