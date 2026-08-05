const style = document.createElement('link');
style.rel = 'stylesheet';
style.href = 'src/beta-content.css';
document.head.append(style);

const escapeTheme = (value = '') => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const create = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};

async function loadJson(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Unable to load ${path}`);
  return response.json();
}

function renderStoryRow(story) {
  const link = create('a', 'story-row');
  link.href = `story-detail.html?id=${encodeURIComponent(story.id)}`;
  link.dataset.storyRow = '';
  link.dataset.theme = escapeTheme(story.primary_theme);

  const content = create('div');
  const meta = create('div', 'story-meta');
  meta.append(create('span', 'chip', story.primary_theme));
  content.append(meta, create('h3', '', story.headline));
  content.append(create('p', '', `${story.broad_function} · ${story.tenure} · ${story.region}`));
  link.append(content, create('span', 'story-arrow', '→'));
  return link;
}

function renderPublishedDirectory(stories) {
  const list = document.querySelector('.company-list');
  if (!list) return;
  const groups = new Map();
  stories.forEach((story) => {
    if (!groups.has(story.employer)) groups.set(story.employer, []);
    groups.get(story.employer).push(story);
  });

  list.replaceChildren();
  [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).forEach(([employer, items], index) => {
    const details = create('details', 'company-group');
    details.dataset.companyGroup = '';
    details.dataset.company = employer;
    details.open = index === 0;

    const summary = create('summary');
    const name = create('div', 'company-name');
    const mark = create('span', 'company-mark', employer.split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase());
    const nameCopy = create('div');
    nameCopy.append(create('h2', '', employer), create('p', '', 'Anonymous, contributor-approved accounts'));
    name.append(mark, nameCopy);
    summary.append(name, create('span', 'company-count', `${items.length} ${items.length === 1 ? 'story' : 'stories'}`));

    const storyList = create('div', 'story-list');
    items.sort((a, b) => b.published_at.localeCompare(a.published_at)).forEach((story) => storyList.append(renderStoryRow(story)));
    details.append(summary, storyList);
    list.append(details);
  });

  document.querySelector('.directory-hero .notice')?.remove();
}

function showAwaitingContributors(status) {
  const list = document.querySelector('.company-list');
  if (!list || document.querySelector('.beta-empty-state')) return;

  const empty = create('section', 'beta-empty-state glass-card');
  empty.setAttribute('aria-labelledby', 'beta-empty-title');
  const eyebrow = create('p', 'eyebrow', 'CONTROLLED BETA');
  const heading = create('h2', '', 'Genuine stories are being prepared.');
  heading.id = 'beta-empty-title';
  const target = status?.target_story_count || 15;
  const employers = status?.minimum_employer_count || 5;
  empty.append(eyebrow, heading, create('p', '', `The first release opens after contributor approval and human moderation. Target: ${target} stories across at least ${employers} employers.`));
  list.before(empty);

  const preview = create('details', 'demo-layout-preview');
  const summary = create('summary', '', 'Preview the fictional directory layout');
  const body = create('div', 'demo-layout-body');
  list.replaceWith(preview);
  body.append(list);
  preview.append(summary, body);
  empty.after(preview);
}

function renderStoryDetail(story) {
  const article = document.querySelector('.story-article');
  if (!article) return;
  const sectionNames = [
    ['beginning', 'The Beginning', 'The opening pull'],
    ['good_part', 'The Good Part', 'What genuinely worked'],
    ['shift', 'The Shift', 'When the experience changed'],
    ['tipping_point', 'The Tipping Point', 'Why leaving became necessary'],
    ['candidate_question', 'The Candidate Question', 'What I would ask before joining'],
    ['right_fit', 'The Right Fit', 'Who might still thrive'],
    ['ai_impact', 'The AI Chapter', 'How technology affected the work'],
  ];

  article.replaceChildren();
  const meta = create('div', 'story-meta');
  story.labels.forEach((label) => meta.append(create('span', 'chip', label)));
  article.append(meta, create('h1', '', story.headline), create('p', 'summary', story.summary));

  sectionNames.forEach(([key, label, title], index) => {
    const value = story.sections[key];
    if (!value) return;
    const section = create('section', `story-section${key === 'candidate_question' ? ' candidate-takeaway' : ''}`);
    section.append(create('small', '', `${String(index + 1).padStart(2, '0')} · ${label.toUpperCase()}`), create('h2', '', title), create('p', '', value));
    article.append(section);
  });
  article.append(create('p', 'perspective-disclaimer', 'One contributor. One role, team and period. Not a verdict on the whole organisation.'));

  const context = document.querySelector('.story-side .glass-card ul');
  if (context) {
    context.replaceChildren();
    [story.anonymous_id, `Function: ${story.broad_function}`, `Tenure: ${story.tenure}`, `Region: ${story.region}`, `Primary theme: ${story.primary_theme}`]
      .forEach((item) => context.append(create('li', '', item)));
  }
}

try {
  const [{ stories = [] }, status] = await Promise.all([
    loadJson('data/published-stories.json'),
    loadJson('data/beta-status.json'),
  ]);

  if (location.pathname.endsWith('stories.html')) {
    if (stories.length) renderPublishedDirectory(stories);
    else showAwaitingContributors(status);
  }

  if (location.pathname.endsWith('story-detail.html')) {
    const id = new URLSearchParams(location.search).get('id');
    const story = stories.find((item) => item.id === id);
    if (story) renderStoryDetail(story);
  }
} catch (error) {
  console.warn('Controlled beta content could not be loaded.', error);
}
