const style = document.createElement('link');
style.rel = 'stylesheet';
style.href = 'src/visual-polish.css';
document.head.append(style);

// Keep the shared logo crisp and dimensionally stable.
document.querySelectorAll('.brand-logo').forEach((image) => {
  image.setAttribute('width', '50');
  image.setAttribute('height', '50');
  image.setAttribute('decoding', 'async');
});

// Below-the-fold raster images should not compete with the initial render.
document.querySelectorAll('main img:not(.brand-logo)').forEach((image) => {
  image.setAttribute('loading', 'lazy');
  image.setAttribute('decoding', 'async');
});

// Only one continuous motion zone should be prominent in a viewport.
const motionZones = [
  document.querySelector('.theme-cloud-card'),
  document.querySelector('.story-door-stage'),
].filter(Boolean);
motionZones.forEach((zone, index) => {
  zone.dataset.motionZone = index === 0 ? 'primary' : 'secondary';
});

// Pause ambient movement while a user is reading or interacting.
document.querySelectorAll('.story-door-stage, .theme-cloud-card').forEach((zone) => {
  zone.addEventListener('focusin', () => zone.classList.add('is-reading'));
  zone.addEventListener('focusout', () => zone.classList.remove('is-reading'));
});

import('./accessibility-polish.js').catch(() => {
  // Accessibility enhancements are additive; semantic source remains the baseline.
});
