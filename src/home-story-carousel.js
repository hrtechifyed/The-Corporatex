const SUPABASE_URL = 'https://otgnnkaawwwwqxlzrfpx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_bYYz3uHOE9py4E84KpEpiw_A4HGdcoX';

const ENDING_LABELS = {
  'break-free': 'Break Free',
  'next-act': 'Next Act',
  'mixed-ending': 'Mixed Ending',
  'pass-the-torch': 'Pass the Torch',
};

const DEMO_STORIES = [
  { id:'demo-1', demo:true, ending_type:'break-free', approved_headline:'When the role stopped matching the promise', approved_summary:'Fictional placeholder only — not an employee submission. This card previews how a moderated CorporateX story will appear.', broad_function:'Product', broad_region:'Example location' },
  { id:'demo-2', demo:true, ending_type:'next-act', approved_headline:'A good chapter that reached its natural end', approved_summary:'Fictional placeholder only — not an employee submission. Real approved stories will replace these examples automatically.', broad_function:'Operations', broad_region:'Example location' },
  { id:'demo-3', demo:true, ending_type:'mixed-ending', approved_headline:'Strong learning, difficult trade-offs', approved_summary:'Fictional placeholder only — not an employee submission. CorporateX will show genuine contributor perspectives here after moderation.', broad_function:'Engineering', broad_region:'Example location' },
  { id:'demo-4', demo:true, ending_type:'pass-the-torch', approved_headline:'I left, but the right person could still thrive', approved_summary:'Fictional placeholder only — not an employee submission. This demonstrates the shape of a future published story card.', broad_function:'People', broad_region:'Example location' },
  { id:'demo-5', demo:true, ending_type:'mixed-ending', approved_headline:'The team was good; the system made it hard', approved_summary:'Fictional placeholder only — not an employee submission. The newest real stories will progressively replace demo cards.', broad_function:'Finance', broad_region:'Example location' },
];

function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function storyHref(story) {
  return story.demo ? 'stories.html' : `story-detail.html?id=${encodeURIComponent(story.id)}`;
}

function endingLabel(value) {
  return ENDING_LABELS[value] || 'Published story';
}

function publishedDate(value) {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
  } catch {
    return '';
  }
}

function storyCard(story, index) {
  const card = make('a', `cx-home-story-card${story.demo ? ' is-demo' : ''}`);
  card.href = storyHref(story);
  card.dataset.ending = story.ending_type || 'mixed-ending';
  card.setAttribute('aria-label', story.demo ? `Fictional CorporateX placeholder: ${story.approved_headline}` : `Read ${story.approved_headline || 'published CorporateX story'}`);

  const art = make('div', 'cx-home-story-card__art');
  const artTop = make('div', 'cx-home-story-card__art-top');
  artTop.append(
    make('span', 'cx-home-story-card__status', story.demo ? 'Demo placeholder' : index === 0 ? 'Newest' : 'Published'),
    make('span', 'cx-home-story-card__ending', story.demo ? 'Fictional example' : endingLabel(story.ending_type)),
  );
  art.append(artTop);

  const body = make('div', 'cx-home-story-card__body');
  const company = make('p', 'cx-home-story-card__company', story.demo ? 'Fictional workplace example' : (story.company_display_name || 'Employer'));
  const headline = make('h3', '', story.approved_headline || 'A workplace experience');
  const summary = make('p', 'cx-home-story-card__summary', story.approved_summary || 'A moderated contributor perspective from the CorporateX archive.');
  const meta = make('div', 'cx-home-story-card__meta');
  if (story.demo) {
    meta.append(make('span', '', story.broad_function), make('span', '', 'Demo only'));
  } else {
    [story.broad_function, story.broad_region, publishedDate(story.published_at)].filter(Boolean).forEach((value) => meta.append(make('span', '', value)));
  }
  const action = make('span', 'cx-home-story-card__action', story.demo ? 'See how Stories work →' : 'Read story →');
  body.append(company, headline, summary, meta, action);
  card.append(art, body);
  return card;
}

function moreStoriesCard() {
  const card = make('a', 'cx-home-story-more');
  card.href = 'stories.html';
  card.setAttribute('aria-label', 'Read more CorporateX stories');
  const orbit = make('span', 'cx-home-story-more__orbit');
  orbit.setAttribute('aria-hidden', 'true');
  card.append(
    orbit,
    make('span', 'cx-home-story-more__kicker', 'KEEP READING'),
    make('h3', '', 'More stories. More sequences.'),
    make('p', '', 'Explore the full CorporateX archive for more published workplace perspectives.'),
    make('span', 'cx-home-story-more__action', 'Read more stories →'),
  );
  return card;
}

function mountCarousel(stories, realCount) {
  const section = document.querySelector('.pages-stories');
  const shell = section?.querySelector('.pages-shell');
  if (!section || !shell || !stories.length) return;

  section.querySelector('.pages-empty-state')?.remove();
  section.querySelector('.cx-home-story-carousel')?.remove();

  const carousel = make('div', 'cx-home-story-carousel');
  carousel.setAttribute('role', 'region');
  carousel.setAttribute('aria-roledescription', 'carousel');
  carousel.setAttribute('aria-label', 'Latest published CorporateX stories and fictional placeholders');

  const chrome = make('div', 'cx-home-story-carousel__chrome');
  const placeholderCount = Math.max(0, 5 - realCount);
  const label = realCount
    ? `${realCount} published · ${placeholderCount} demo placeholder${placeholderCount === 1 ? '' : 's'}`
    : 'Archive forming · 5 clearly fictional demo placeholders';
  const count = make('p', 'cx-home-story-carousel__count', label);
  const buttons = make('div', 'cx-home-story-carousel__buttons');
  const previous = make('button', '', '←');
  previous.type = 'button';
  previous.setAttribute('aria-label', 'Previous story');
  const next = make('button', '', '→');
  next.type = 'button';
  next.setAttribute('aria-label', 'Next story');
  buttons.append(previous, next);
  chrome.append(count, buttons);

  const viewport = make('div', 'cx-home-story-carousel__viewport');
  viewport.tabIndex = 0;
  viewport.setAttribute('aria-label', 'Scrollable latest story cards');
  const track = make('div', 'cx-home-story-carousel__track');
  stories.slice(0, 5).forEach((story, index) => track.append(storyCard(story, index)));
  track.append(moreStoriesCard());
  viewport.append(track);
  carousel.append(chrome, viewport);
  shell.append(carousel);

  function stepWidth() {
    const first = track.firstElementChild;
    if (!first) return viewport.clientWidth;
    const styles = getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;
    return first.getBoundingClientRect().width + gap;
  }

  function move(direction, behavior = 'smooth') {
    const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    if (max <= 2) return;
    const amount = stepWidth();
    if (direction > 0 && viewport.scrollLeft >= max - amount * 0.45) {
      viewport.scrollTo({ left: 0, behavior });
      return;
    }
    if (direction < 0 && viewport.scrollLeft <= amount * 0.45) {
      viewport.scrollTo({ left: max, behavior });
      return;
    }
    viewport.scrollBy({ left: amount * direction, behavior });
  }

  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));

  viewport.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
  });

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion && track.children.length > 2) {
    let timer = null;
    const stop = () => { if (timer) window.clearInterval(timer); timer = null; };
    const start = () => {
      stop();
      if (document.hidden) return;
      timer = window.setInterval(() => move(1), 5200);
    };
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', start);
    carousel.addEventListener('pointerdown', stop);
    carousel.addEventListener('pointerup', start);
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    start();
  }
}

async function loadLatestPublishedStories() {
  if (!document.querySelector('.pages-stories')) return;
  try {
    const query = 'published_experiences?select=id,approved_headline,approved_summary,broad_function,broad_region,company_display_name,ending_type,published_at&order=published_at.desc&limit=5';
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${query}`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`Published story archive unavailable (${response.status})`);
    const rows = await response.json();
    const published = Array.isArray(rows) ? rows.slice(0, 5) : [];
    const display = [...published, ...DEMO_STORIES.slice(0, Math.max(0, 5 - published.length))];
    mountCarousel(display, published.length);
  } catch (error) {
    console.error('CorporateX latest story carousel could not load.', error);
    mountCarousel(DEMO_STORIES, 0);
  }
}

loadLatestPublishedStories();
