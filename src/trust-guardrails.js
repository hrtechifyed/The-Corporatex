const style = document.createElement('link');
style.rel = 'stylesheet';
style.href = 'src/trust-guardrails.css';
document.head.append(style);

const allowedTrustLabels = new Set([
  'Anonymous contributor',
  'Contributor approved',
  'Human moderated',
  'Contributor perspective',
  'Demonstration story',
]);

const forbiddenVerificationPattern = /verified\s+(employee|ex-employee)|independently verified|confirmed account/i;

document.querySelectorAll('.chip, .trust-strip span').forEach((node) => {
  const label = node.textContent.trim();
  if (forbiddenVerificationPattern.test(label)) {
    node.textContent = 'Contributor perspective';
  }
});

if (document.body.dataset.page === 'home') {
  const trust = document.querySelector('.trust-strip');
  if (trust) {
    trust.innerHTML = '<span><i>◇</i> Anonymous contributor</span><span><i>✓</i> Contributor approved</span><span><i>⌁</i> Human moderated</span>';
  }
}

if (location.pathname.endsWith('story-detail.html')) {
  const meta = document.querySelector('.story-article > .story-meta');
  if (meta) {
    meta.innerHTML = '<span class="chip">Demonstration story</span><span class="chip">Contributor perspective</span>';
  }

  const candidateSection = [...document.querySelectorAll('.story-section')]
    .find((section) => /candidate question/i.test(section.textContent));
  candidateSection?.classList.add('candidate-takeaway');

  const article = document.querySelector('.story-article');
  if (article && !article.querySelector('.perspective-disclaimer')) {
    const disclaimer = document.createElement('p');
    disclaimer.className = 'perspective-disclaimer';
    disclaimer.textContent = 'One contributor. One role, team and period. Not a verdict on the whole organisation.';
    article.append(disclaimer);
  }
}

if (location.pathname.endsWith('stories.html')) {
  const notice = document.querySelector('.directory-hero .notice');
  if (notice) notice.setAttribute('role', 'note');
}

export { allowedTrustLabels, forbiddenVerificationPattern };

import('./visual-polish.js').catch(() => {
  // Visual enhancements are optional and must not block core content.
});
