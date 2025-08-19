// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('contactForm');
const statusEl = document.getElementById('formStatus');

// Dropdown + helper text logic
const topicEl = document.getElementById('topic');
const helpEl = document.getElementById('helpText');

function updateHelpText(value) {
  switch (value) {
    case 'diagnosis':
      helpEl.textContent = "Let us know what's not working with your board, and any recent activity that may have caused the issue";
      break;
    case 'repair':
      helpEl.textContent = "Let us know what board you have and what isn't working";
      break;
    case 'vesc':
      helpEl.textContent = "What model board do you have? What controller and other parts would like installed?";
      break;
    case 'assembly':
      helpEl.textContent = "What type of board would you like assembled for you? If you already have the parts, please list them in this message";
      break;
    case 'other':
      helpEl.textContent = "We're here to help :)";
      break;
    default:
      helpEl.textContent = '';
  }
}
topicEl.addEventListener('change', (e) => updateHelpText(e.target.value));
updateHelpText(topicEl.value || '');

// Submit form
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.textContent = 'Sending...';

  const formData = new FormData(form);
  const actionUrl = form.getAttribute('action');

  try {
    const res = await fetch(actionUrl, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData
    });

    if (res.ok) {
      statusEl.textContent = 'Thanks! Your message has been sent. We will be in contact with you shortly.';
      form.reset();
      updateHelpText('');
    } else {
      let msg = 'Could not send. Please try again later, or email us directly.';
      try {
        const data = await res.json();
        if (data && data.errors && data.errors.length) {
          msg = data.errors.map(e => e.message).join(' ');
        }
      } catch (_) {}
      statusEl.textContent = msg;
    }
  } catch (err) {
    statusEl.textContent = 'Network error. Please try again, or email us directly.';
  }
});
