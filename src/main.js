import './story-flow.js';

const logoAsset = 'public/hrtechify-logo.svg';

document.querySelectorAll('img[src$="hrtechify-logo.svg"]').forEach((image) => {
  image.setAttribute('src', logoAsset);
});

document.querySelectorAll('link[rel="icon"]').forEach((icon) => {
  icon.setAttribute('href', logoAsset);
});

if (!document.querySelector('link[href$="readability-fixes.css"]')) {
  const readabilityStyles = document.createElement('link');
  readabilityStyles.rel = 'stylesheet';
  readabilityStyles.href = 'src/readability-fixes.css';
  document.head.append(readabilityStyles);
}

const sharedFooter = document.querySelector('.footer');
if (sharedFooter) {
  sharedFooter.innerHTML = `
    <div class="footer-shell">
      <p class="footer-primary">The Corporate Ex - Powered by - HRTechify - People • Technology • Growth</p>
      <p class="footer-secondary">© 2026 All Rights Reserved.</p>
    </div>`;
}

document.documentElement.classList.add('js');

const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('#mobile-nav');

if (menuButton && mobileNav) {
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
}

const dialog = document.querySelector('#story-dialog');
if (dialog) {
  document.querySelectorAll('[data-story]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    dialog.showModal();
  }));

  document.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduceMotion) {
  window.addEventListener('pointermove', (event) => {
    document.documentElement.style.setProperty('--mx', `${event.clientX}px`);
    document.documentElement.style.setProperty('--my', `${event.clientY}px`);
  }, { passive: true });

  const heroArt = document.querySelector('.hero-art');
  if (heroArt) {
    heroArt.addEventListener('pointermove', (event) => {
      const rect = heroArt.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      heroArt.style.setProperty('--ry', `${x * 8}deg`);
      heroArt.style.setProperty('--rx', `${y * -7}deg`);
      heroArt.style.setProperty('--px', `${x * 16}px`);
      heroArt.style.setProperty('--py', `${y * 16}px`);
    });

    heroArt.addEventListener('pointerleave', () => {
      heroArt.style.setProperty('--ry', '0deg');
      heroArt.style.setProperty('--rx', '0deg');
      heroArt.style.setProperty('--px', '0px');
      heroArt.style.setProperty('--py', '0px');
    });
  }

  document.querySelectorAll('.experience').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      card.style.setProperty('--tilt-y', `${(x - 0.5) * 7}deg`);
      card.style.setProperty('--tilt-x', `${(y - 0.5) * -6}deg`);
      card.style.setProperty('--shine-x', `${x * 100}%`);
      card.style.setProperty('--shine-y', `${y * 100}%`);
      card.style.setProperty('--shine-opacity', '1');
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-y', '0deg');
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--shine-opacity', '0');
    });
  });
}

const revealGroups = [
  '.section-heading > *',
  '.experience',
  '.journey-copy > *',
  '.timeline li',
  '.story-flow-intro > *',
  '.story-builder',
  '.safety-grid > *',
  '.safety-points article',
  '.policy-card',
  '.more-card',
  '.rules-banner > *',
];

const revealTargets = document.querySelectorAll(revealGroups.join(','));
revealTargets.forEach((element, index) => {
  element.classList.add('reveal-target');
  element.style.setProperty('--reveal-delay', `${Math.min(index % 5, 4) * 75}ms`);
});

if ('IntersectionObserver' in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.13, rootMargin: '0px 0px -8% 0px' });

  revealTargets.forEach((target) => revealObserver.observe(target));

  const timelineItems = document.querySelectorAll('.timeline li');
  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      timelineItems.forEach((item) => item.classList.remove('timeline-current'));
      entry.target.classList.add('timeline-current');
    });
  }, { threshold: 0.65 });

  timelineItems.forEach((item) => timelineObserver.observe(item));
} else {
  revealTargets.forEach((target) => target.classList.add('is-visible'));
}
