const body = document.body;
const file = location.pathname.split('/').filter(Boolean).at(-1) || 'index.html';

function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function polishStoriesIndex() {
  if (body?.dataset.page !== 'stories') return;

  const notice = document.querySelector('.directory-hero .notice');
  if (notice) {
    notice.textContent = 'Published workplace stories, grouped by employer so you can compare context without reducing an experience to a score.';
  }

  const companyList = document.querySelector('.company-list');
  if (!companyList) return;

  const markReady = () => {
    const hasLiveStory = Boolean(companyList.querySelector('.cx-story-shell'));
    const hasRuntimeState = Boolean(companyList.querySelector(':scope > .glass-card'));
    if (hasLiveStory || hasRuntimeState) body.classList.add('cx-stories-ready');
  };

  markReady();
  const observer = new MutationObserver(markReady);
  observer.observe(companyList, { childList: true, subtree: true });
}

function replaceDetailSidebar() {
  const aside = document.querySelector('.story-side');
  if (!aside || aside.dataset.publicStorySide === 'true') return;

  const perspective = make('section', 'glass-card');
  perspective.append(
    make('h3', '', 'One perspective'),
    make('p', '', 'This story reflects one person, role, team and period. Use it as context—not a verdict on an entire employer.'),
  );

  const forward = make('section', 'glass-card');
  forward.append(
    make('h3', '', 'Use it forward'),
    make('p', '', 'Look for the sequence: what attracted them, what worked, what changed and what you would want to ask before joining.'),
  );

  const next = make('section', 'glass-card');
  const link = make('a', 'button button-secondary', 'Browse more stories');
  link.href = 'stories.html';
  next.append(make('h3', '', 'Keep exploring'), link);

  aside.replaceChildren(perspective, forward, next);
  aside.classList.add('cx-public-story-side');
  aside.dataset.publicStorySide = 'true';
}

function polishStoryDetail() {
  if (file !== 'story-detail.html') return;

  const article = document.querySelector('.story-article');
  if (!article) return;

  const normalize = () => {
    const hydrated = Boolean(article.querySelector('.cx-detail-actions, .cx-qa')) || article.querySelector('h1')?.textContent?.trim() === 'Story unavailable';
    if (!hydrated) return;

    article.querySelectorAll('.chip').forEach((chip) => {
      if (chip.textContent?.trim() === 'Published contributor perspective') chip.textContent = 'Workplace story';
    });

    article.querySelectorAll('p.summary').forEach((summary) => {
      if (/contributor-approved/i.test(summary.textContent || '')) {
        summary.textContent = 'A published workplace perspective from the CorporateX story archive.';
      }
    });

    article.querySelectorAll('.story-section').forEach((section) => {
      const heading = section.querySelector('h2');
      const kicker = section.querySelector('small');
      if (heading?.textContent?.trim() === 'What the contributor approved for publication') {
        heading.textContent = 'The experience';
        if (kicker) kicker.textContent = 'THE STORY';
      }
      const paragraph = section.querySelector('p');
      if (paragraph?.textContent?.trim() === 'Contributor-selected broad context.') {
        paragraph.textContent = 'Broad context shared with this story.';
      }
    });

    replaceDetailSidebar();
    body.classList.add('cx-story-detail-ready');
  };

  normalize();
  const observer = new MutationObserver(normalize);
  observer.observe(article, { childList: true, subtree: true, characterData: true });
}

function keepOneHomepageStorySurface() {
  if (file !== 'index.html' && !location.pathname.endsWith('/The-Corporatex/')) return;
  document.querySelector('.pages-archive')?.remove();
}

keepOneHomepageStorySurface();
polishStoriesIndex();
polishStoryDetail();
