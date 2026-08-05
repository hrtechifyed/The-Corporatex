const page = document.body.dataset.page || '';

const style = document.createElement('link');
style.rel = 'stylesheet';
style.href = 'src/site-upgrades.css';
document.head.append(style);

const setText = (selector, value) => {
  const node = document.querySelector(selector);
  if (node) node.textContent = value;
};

const setHtml = (selector, value) => {
  const node = document.querySelector(selector);
  if (node) node.innerHTML = value;
};

// Honest prototype language until genuine moderated stories are published.
document.querySelectorAll('.brand-copy span').forEach((node) => {
  node.textContent = 'Exit stories. Smarter decisions.';
});

if (page === 'home') {
  setText('.hero-copy .eyebrow', 'EXIT STORIES FOR BETTER DECISIONS');
  setHtml('.hero-copy .display-title', 'Before you join,<br><em>hear from the people who left.</em>');
  setHtml('.hero-copy .lede', 'Honest exit stories for better employer decisions.');
  setHtml('.trust-strip', '<span><i>◇</i> Anonymous</span><span><i>✓</i> Contributor approved</span><span><i>⌁</i> Human moderated</span>');
  setText('#cloud-title', 'THEMES WORKPLACE EXITS CAN REVEAL');
  setHtml('.cloud-caption', '<span>Choose a theme to explore employer stories.</span>');

  const howHeading = document.querySelector('.how-grid')?.previousElementSibling;
  if (howHeading) {
    howHeading.innerHTML = '<div><p class="eyebrow">HOW IT WORKS</p><h2>One exit. One better question.</h2></div>';
  }
  const cards = [...document.querySelectorAll('.how-card')];
  const cardCopy = [
    ['Share honestly', 'Tell the experience in your own voice.'],
    ['Reviewed with care', 'You approve it; a human moderates it.'],
    ['Help someone choose', 'Give a future candidate one better question.'],
  ];
  cards.forEach((card, index) => {
    const copy = cardCopy[index];
    if (!copy) return;
    const heading = card.querySelector('h3');
    const paragraph = card.querySelector('p');
    if (heading) heading.textContent = copy[0];
    if (paragraph) paragraph.textContent = copy[1];
  });

  setText('.ai-banner .eyebrow', 'THE AI-ERA QUESTION');
  setText('.ai-banner h2', 'AI is changing work. Employers are choosing how.');
  setText('.ai-banner p', 'Exit stories show how people were treated through that change.');
  setText('.ai-banner .button', 'Why it matters →');
}

if (page === 'more') {
  setText('.info-hero .eyebrow', 'WHY THE CORPORATE EX');
  setHtml('.info-hero .display-title', 'Exit intelligence,<br><em>not another review feed.</em>');
  setText('.info-hero .lede', 'Understand what changed, why someone left and what to ask before joining.');

  const cards = [...document.querySelectorAll('.info-card')];
  const copy = [
    ['Why it exists', 'Ratings show sentiment. Exit stories preserve context.'],
    ['How it differs', 'Conversations discuss work. Reviews score it. We focus on why people left.'],
    ['Employer choice in the AI era', 'The important question is how employers treat people while work changes.'],
    ['Contact', 'Questions, privacy requests or ideas for the beta.'],
  ];
  cards.forEach((card, index) => {
    const item = copy[index];
    if (!item) return;
    const heading = card.querySelector('h2');
    const paragraph = card.querySelector('p:not(.eyebrow)');
    if (heading) heading.textContent = item[0];
    if (paragraph) paragraph.textContent = item[1];
    card.querySelector('ul')?.remove();
  });
}

if (page === 'privacy') {
  setText('.info-hero .eyebrow', 'PRIVACY & SAFETY');
  setHtml('.info-hero .display-title', 'Serious stories deserve<br><em>a steady hand.</em>');
  setText('.info-hero .lede', 'Private drafts, careful wording and human review before publication.');

  const cards = [...document.querySelectorAll('.policy-card')];
  const rules = [
    ['Drafts stay private', 'A draft is not a public story.'],
    ['Remove identifying details', 'Do not include names, records or confidential information.'],
    ['Speak from your experience', 'Use first-person language and avoid universal claims.'],
    ['Humans review first', 'Contributor approval does not publish a story.'],
    ['AI may organise, never invent', 'AI cannot add events, decide truth or publish.'],
    ['Report a concern', 'Contact hrtechifyed@gmail.com for privacy or moderation requests.'],
  ];
  cards.forEach((card, index) => {
    const rule = rules[index];
    if (!rule) return;
    const heading = card.querySelector('h2');
    const paragraph = card.querySelector('p:not(.eyebrow)');
    if (heading) heading.textContent = rule[0];
    if (paragraph) paragraph.textContent = rule[1];
    card.querySelector('ul')?.remove();
  });
}

export const copyBudgets = Object.freeze({
  home: 180,
  share: 80,
  guided: 150,
  stories: 80,
  more: 140,
  privacy: 160,
  storyDetailPlatformCopy: 80,
});
