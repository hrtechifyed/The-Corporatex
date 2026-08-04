const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('#mobile-nav');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
  mobileNav.hidden = open;
});
mobileNav.addEventListener('click', () => {
  mobileNav.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
});

const dialog = document.querySelector('#story-dialog');
document.querySelectorAll('[data-story]').forEach((link) => link.addEventListener('click', (event) => {
  event.preventDefault();
  dialog.showModal();
}));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

const toast = document.querySelector('.toast');
document.querySelector('.path-card').addEventListener('submit', (event) => {
  event.preventDefault();
  const path = new FormData(event.currentTarget).get('path');
  toast.textContent = `${path === 'guided' ? 'Guided story' : 'Director’s Cut'} selected. Your private draft is ready to begin.`;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 3500);
});
