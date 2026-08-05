const page = document.body.dataset.page || '';

const style = document.createElement('link');
style.rel = 'stylesheet';
style.href = 'src/progressive-disclosure.css';
document.head.append(style);

function makeDisclosureCard(card, summaryLabel, detailText, open = false) {
  if (!card || card.matches('details')) return card;
  const details = document.createElement('details');
  details.className = `${card.className} disclosure-card`;
  details.open = open;
  if (card.id) details.id = card.id;

  const icon = card.querySelector('.info-icon')?.outerHTML || '';
  const eyebrow = card.querySelector('.eyebrow')?.textContent || '';
  const heading = card.querySelector('h2')?.textContent || summaryLabel;
  const summaryCopy = card.querySelector('p:not(.eyebrow)')?.textContent || '';
  const action = card.querySelector('a')?.outerHTML || '';

  details.innerHTML = `
    <summary>
      ${icon}
      <span class="disclosure-summary-copy">
        ${eyebrow ? `<small>${eyebrow}</small>` : ''}
        <strong>${heading}</strong>
        <span>${summaryCopy}</span>
      </span>
      <span class="disclosure-marker" aria-hidden="true">+</span>
    </summary>
    <div class="disclosure-body">
      <p>${detailText}</p>
      ${action}
    </div>`;

  card.replaceWith(details);
  return details;
}

if (page === 'more') {
  const details = [
    'The sequence matters: what attracted someone, what worked, what changed and what a candidate should investigate before joining.',
    'Blind and Fishbowl centre conversations. Glassdoor combines reviews, ratings, salaries and jobs. The Corporate Ex centres structured, contributor-approved exit accounts.',
    'Contributors should describe what they directly experienced: whether AI removed repetitive work, increased expectations, redesigned roles or affected job security.',
    'Use the contact channel for partnerships, product feedback, privacy requests or moderation concerns.',
  ];
  [...document.querySelectorAll('.info-card')].forEach((card, index) => {
    makeDisclosureCard(card, card.querySelector('h2')?.textContent, details[index] || '', index === 0);
  });
}

if (page === 'privacy') {
  const details = [
    'The production design separates private contributor information from content that may later become public.',
    'Remove names, contact details, employee records, customer information, trade secrets and details that could identify another person.',
    'Prefer phrases such as “I experienced”, “I was told” and “In my team”. One account should not become a universal statement.',
    'A contributor can approve wording, but only a human moderator can publish, request changes, reject or unpublish.',
    'AI may help structure text or flag personal information. It must not add events, intensify claims, determine truth or publish.',
    'Email hrtechifyed@gmail.com to request correction, withdrawal, deletion or review of a privacy concern.',
  ];
  [...document.querySelectorAll('.policy-card')].forEach((card, index) => {
    makeDisclosureCard(card, card.querySelector('h2')?.textContent, details[index] || '', false);
  });
}

if (location.pathname.endsWith('freeflow-story.html')) {
  const form = document.querySelector('.story-form-lite');
  const sections = [...form?.querySelectorAll(':scope > .form-section') || []];
  const themeSection = sections.find((section) => section.querySelector('.story-door-stage'));
  const writingSection = sections.find((section) => section.querySelector('#freeflow-experience'));

  if (form && themeSection && writingSection) {
    form.insertBefore(writingSection, themeSection);
    const wrapper = document.createElement('details');
    wrapper.className = 'optional-theme-disclosure';
    const summary = document.createElement('summary');
    summary.innerHTML = '<span><strong>Add an optional theme</strong><small>Use this only when it helps organise the story.</small></span><span aria-hidden="true">+</span>';
    const body = document.createElement('div');
    body.className = 'optional-theme-body';
    while (themeSection.firstChild) body.append(themeSection.firstChild);
    wrapper.append(summary, body);
    themeSection.append(wrapper);
  }
}

if (location.pathname.endsWith('guided-story.html')) {
  document.querySelectorAll('.chapter-button span').forEach((node) => {
    node.hidden = true;
  });
}

import('./trust-guardrails.js').catch(() => {
  // Trust copy enhancements must never prevent reading or drafting a story.
});
