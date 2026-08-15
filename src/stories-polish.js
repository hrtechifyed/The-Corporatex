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
    notice.textContent = 'Genuine, moderated workplace stories, grouped by employer so you can compare context without reducing an experience to a score.';
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
      if (heading?.textContent?.trim() === 'What the contributor approved for publication') {
        section.remove();
        return;
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
  const isHome = file === 'index.html' || file === 'The-Corporatex' || location.pathname.endsWith('/The-Corporatex/');
  if (!isHome) return;

  const archive = document.querySelector('.pages-archive');
  if (!archive) return;

  const guide = archive.classList.contains('cx-home-story-guide') ? archive : make('div', 'pages-archive cx-home-story-guide');
  guide.setAttribute('aria-label', 'How to read a CorporateX workplace story');

  const renderGuide = () => {
    if (guide.querySelector('.cx-home-story-guide__card')) return;
    const card = make('article', 'cx-home-story-guide__card');
    const art = make('div', 'cx-home-story-guide__art');
    art.setAttribute('aria-hidden', 'true');
    const copy = make('div', 'cx-home-story-guide__copy');
    copy.append(
      make('small', '', 'HOW TO READ A STORY'),
      make('h2', '', 'Follow the sequence, not just the ending.'),
      make('p', '', 'What attracted them, what worked, what changed and what they would ask before joining—that is where the useful signal lives.'),
    );
    card.append(art, copy);
    guide.replaceChildren(card);
  };

  if (archive !== guide) archive.replaceWith(guide);
  renderGuide();

  const observer = new MutationObserver(renderGuide);
  observer.observe(guide, { childList: true });
}

keepOneHomepageStorySurface();
polishStoriesIndex();
polishStoryDetail();
