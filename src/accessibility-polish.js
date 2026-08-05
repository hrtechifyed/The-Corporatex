const style = document.createElement('link');
style.rel = 'stylesheet';
style.href = 'src/accessibility-polish.css';
document.head.append(style);

// Keep interactive state available to assistive technology.
document.querySelectorAll('[data-theme-filter]').forEach((button) => {
  const sync = () => button.setAttribute('aria-pressed', String(button.classList.contains('is-active')));
  sync();
  button.addEventListener('click', () => requestAnimationFrame(sync));
});

document.querySelectorAll('.story-door').forEach((button) => {
  const sync = () => button.setAttribute('aria-pressed', String(button.classList.contains('is-selected')));
  sync();
  button.addEventListener('click', () => requestAnimationFrame(() => {
    document.querySelectorAll('.story-door').forEach((door) => {
      door.setAttribute('aria-pressed', String(door.classList.contains('is-selected')));
    });
  }));
});

document.querySelectorAll('details').forEach((details) => {
  const summary = details.querySelector(':scope > summary');
  if (!summary) return;
  const sync = () => summary.setAttribute('aria-expanded', String(details.open));
  sync();
  details.addEventListener('toggle', sync);
});

// Associate helper text with the nearest control when source markup does not already do so.
document.querySelectorAll('.field').forEach((label, index) => {
  const control = label.querySelector('input, select, textarea');
  const helper = label.querySelector('small');
  if (!control || !helper || control.getAttribute('aria-describedby')) return;
  helper.id ||= `field-help-${index + 1}`;
  control.setAttribute('aria-describedby', helper.id);
});

// Announce the active writing mode without adding visual copy.
const mode = document.querySelector('.mode-switch [aria-current="page"]');
if (mode) {
  const announcement = document.createElement('p');
  announcement.className = 'sr-only';
  announcement.setAttribute('role', 'status');
  announcement.textContent = `${mode.textContent.trim()} story mode selected.`;
  document.querySelector('main')?.prepend(announcement);
}
