const page = document.body.dataset.refPage;
document.querySelectorAll('[data-ref-nav]').forEach((link) => {
  if (link.dataset.refNav === page) link.setAttribute('aria-current', 'page');
});

const menuButton = document.querySelector('[data-ref-menu]');
const mobileNav = document.querySelector('[data-ref-mobile-nav]');
if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    mobileNav.hidden = open;
  });
}

const toast = document.querySelector('.ref-toast');
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 3600);
}
document.querySelectorAll('[data-ref-signin]').forEach((button) => {
  button.addEventListener('click', () => showToast('Sign in will be added later. The current experience is open to everyone.'));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mobileNav && !mobileNav.hidden) {
    mobileNav.hidden = true;
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.focus();
  }
});
