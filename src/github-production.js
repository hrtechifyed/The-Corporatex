const SUPABASE_URL = 'https://otgnnkaawwwwqxlzrfpx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_bYYz3uHOE9py4E84KpEpiw_A4HGdcoX';
const GITHUB_BASE = '/The-Corporatex/';

function localHref(path = '') {
  const normalized = String(path).replace(/^\/+/, '');
  return `${GITHUB_BASE}${normalized}`;
}

function currentFile() {
  return location.pathname.split('/').filter(Boolean).at(-1) || 'index.html';
}

function isRouteActive(route) {
  const file = currentFile();
  if (route === 'home') return (file === 'index.html' || file === 'The-Corporatex') && location.hash !== '#about';
  if (route === 'stories') return file === 'stories.html' || file === 'story-detail.html';
  if (route === 'how') return file === 'how-it-works.html' || file === 'more-info.html';
  if (route === 'about') return (file === 'index.html' || file === 'The-Corporatex') && location.hash === '#about';
  if (route === 'account') return file === 'account.html' || file === 'login.html';
  return false;
}

function userIcon() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.2"/><path d="M5.5 19.2c.7-3.3 3-5 6.5-5s5.8 1.7 6.5 5"/></svg>';
}

function navAnchor(label, href, route, className = '') {
  const current = isRouteActive(route) ? ' aria-current="page"' : '';
  const cls = className ? ` class="${className}"` : '';
  return `<a href="${href}" data-cx-route="${route}"${cls}${current}>${label}</a>`;
}

function mountUnifiedHeader() {
  document.querySelector('.pages-preview-note')?.remove();
  document.querySelector('.pages-header')?.remove();
  document.querySelector('.ref-nav')?.remove();
  document.querySelector('.ref-mobile-nav')?.remove();

  const main = document.querySelector('main#main');
  if (main) main.style.paddingTop = '0';

  if (document.querySelector('.cx-unified-header')) return;

  const accountPage = currentFile() === 'account.html';
  const accountHref = accountPage ? localHref('account.html') : localHref('login.html');
  const accountLabel = accountPage ? 'My Stories' : 'Sign In';

  const header = document.createElement('header');
  header.className = 'cx-unified-header';
  header.innerHTML = `
    <div class="cx-unified-header__inner">
      <a class="cx-unified-brand" href="${localHref()}" aria-label="HRTechify CorporateX home">
        <span class="cx-unified-brand__mark">
          <img src="${localHref('hrtechify-logo.svg')}" alt="HRTechify" width="50" height="50" />
          <span class="cx-unified-brand__orbit" aria-hidden="true"></span>
        </span>
        <span class="cx-unified-brand__parent">HRTechify</span>
        <span class="cx-unified-brand__product">Corporate<b>X</b></span>
      </a>
      <span class="cx-unified-signal" aria-hidden="true"><i></i><i></i><i></i></span>
      <nav class="cx-unified-nav" aria-label="Primary navigation">
        ${navAnchor('Home', localHref(), 'home')}
        ${navAnchor('Stories', localHref('stories.html'), 'stories')}
        ${navAnchor('How It Works', localHref('how-it-works.html'), 'how')}
        ${navAnchor('About', `${localHref()}#about`, 'about')}
        ${navAnchor(`${userIcon()}<span>${accountLabel}</span>`, accountHref, 'account', 'cx-unified-account')}
      </nav>
      <details class="cx-unified-menu">
        <summary aria-label="Open navigation"><span></span></summary>
        <nav aria-label="Mobile navigation">
          ${navAnchor('Home', localHref(), 'home')}
          ${navAnchor('Stories', localHref('stories.html'), 'stories')}
          ${navAnchor('How It Works', localHref('how-it-works.html'), 'how')}
          ${navAnchor('About', `${localHref()}#about`, 'about')}
          ${navAnchor('Privacy & Safety', localHref('privacy-safety.html'), 'privacy')}
          ${navAnchor('Share Your Story', localHref('guided-story.html'), 'share', 'cx-mobile-primary')}
          ${navAnchor(accountLabel, accountHref, 'account')}
        </nav>
      </details>
    </div>`;

  const skip = document.querySelector('.skip-link');
  if (skip) skip.after(header);
  else document.body.prepend(header);

  const menu = header.querySelector('.cx-unified-menu');
  menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => menu.removeAttribute('open')));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu?.hasAttribute('open')) {
      menu.removeAttribute('open');
      menu.querySelector('summary')?.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (menu?.hasAttribute('open') && !menu.contains(event.target)) menu.removeAttribute('open');
  });
}

function refreshActiveNavigation() {
  document.querySelectorAll('[data-cx-route]').forEach((link) => {
    if (isRouteActive(link.dataset.cxRoute)) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function rewriteProductionLinks() {
  document.querySelectorAll('a[href*="corporatex.onrender.com"]').forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (/\/browse(?:$|[?#])/.test(href)) link.setAttribute('href', localHref('stories.html'));
    else if (/\/submit/.test(href)) link.setAttribute('href', localHref('guided-story.html'));
    else if (/\/login/.test(href)) link.setAttribute('href', localHref('login.html'));
    else if (/\/more/.test(href)) link.setAttribute('href', localHref('how-it-works.html'));
    else if (/\/about/.test(href)) link.setAttribute('href', `${localHref()}#about`);
    else if (/#live-signals/.test(href)) link.setAttribute('href', localHref('stories.html#story-search'));
    else link.setAttribute('href', localHref());
  });

  document.querySelectorAll('a[href$="more-info.html"], a[href="more-info.html"]').forEach((link) => {
    link.setAttribute('href', localHref('how-it-works.html'));
    if (link.textContent?.trim() === 'More') link.textContent = 'How It Works';
  });
}

function addAnimePresence() {
  document.querySelectorAll('.ref-page .hero-space:not(.story-detail-layout), .ref-page .directory-hero').forEach((section) => {
    section.dataset.animeShell = 'true';
  });
}

async function rest(path) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: 'application/json',
    },
  });
  if (!response.ok) throw new Error(`Supabase request failed (${response.status})`);
  return response.json();
}

function make(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text != null) el.textContent = text;
  return el;
}

function themeForStory(story) {
  const text = `${story.approved_headline || ''} ${story.approved_summary || ''} ${story.main_reason || ''}`.toLowerCase();
  if (/ai|automation/.test(text)) return 'ai';
  if (/lead|manager|culture/.test(text)) return 'leadership';
  if (/burnout|workload|stress|wellbeing/.test(text)) return 'wellbeing';
  if (/pay|salary|compensation/.test(text)) return 'compensation';
  if (/growth|promotion|learning/.test(text)) return 'growth';
  if (/change|restruct|layoff/.test(text)) return 'change';
  return 'personal';
}

function buildStoryRow(story) {
  const a = make('a', 'story-row card-interactive');
  a.dataset.storyRow = '';
  a.dataset.theme = themeForStory(story);
  a.href = localHref(`story-detail.html?id=${encodeURIComponent(story.id)}`);

  const thumb = make('span', 'story-thumb');
  thumb.textContent = '✦';
  const body = document.createElement('div');
  const meta = make('div', 'story-meta');
  meta.append(make('span', 'chip', story.main_reason || 'Workplace story'));
  body.append(meta, make('h3', '', story.approved_headline || 'A workplace experience'));
  body.append(make('p', '', [story.broad_function, story.approximate_tenure, story.broad_region].filter(Boolean).join(' · ')));
  const arrow = make('span', 'story-arrow', '→');
  a.append(thumb, body, arrow);
  return a;
}

async function hydrateStoriesPage() {
  const companyList = document.querySelector('.company-list');
  if (!companyList) return;

  const heroNotice = document.querySelector('.directory-hero .notice');
  if (heroNotice) heroNotice.textContent = 'Published CorporateX stories are loaded directly from the confirmed archive.';
  companyList.replaceChildren(make('div', 'glass-card', 'Loading published stories…'));

  try {
    const stories = await rest('published_experiences?select=id,approved_headline,approved_summary,broad_function,broad_region,approximate_tenure,main_reason,public_slug,published_at,company_display_name,company_slug&order=published_at.desc');
    companyList.replaceChildren();

    if (!stories.length) {
      const empty = make('div', 'glass-card');
      empty.append(make('h2', '', 'The confirmed archive is forming.'));
      empty.append(make('p', '', 'No published workplace stories are available yet. CorporateX will show only genuine, moderated stories here.'));
      companyList.append(empty);
      const legacyEmpty = document.querySelector('[data-empty-state]');
      if (legacyEmpty) legacyEmpty.style.display = 'none';
      return;
    }

    const groups = new Map();
    for (const story of stories) {
      const name = story.company_display_name || 'Employer';
      if (!groups.has(name)) groups.set(name, []);
      groups.get(name).push(story);
    }

    for (const [company, items] of groups) {
      const details = make('details', 'company-group');
      details.dataset.companyGroup = '';
      details.dataset.company = company;
      details.open = true;
      const summary = document.createElement('summary');
      const nameWrap = make('div', 'company-name');
      nameWrap.append(make('span', 'company-mark', company.slice(0, 1).toUpperCase()));
      const nameText = document.createElement('div');
      nameText.append(make('h2', '', company), make('p', '', `${items.length} published ${items.length === 1 ? 'story' : 'stories'}`));
      nameWrap.append(nameText);
      summary.append(nameWrap, make('span', 'company-count', `${items.length} ${items.length === 1 ? 'story' : 'stories'}`));
      const list = make('div', 'story-list');
      items.forEach((story) => list.append(buildStoryRow(story)));
      details.append(summary, list);
      companyList.append(details);
    }
  } catch (error) {
    companyList.replaceChildren();
    const card = make('div', 'glass-card');
    card.append(make('h2', '', 'Stories are temporarily unavailable.'));
    card.append(make('p', '', 'The CorporateX archive could not be reached. Please try again shortly.'));
    companyList.append(card);
    console.error(error);
  }
}

async function hydrateStoryDetail() {
  const article = document.querySelector('.story-article');
  if (!article) return;
  const id = new URLSearchParams(location.search).get('id');
  if (!id) return;

  try {
    const rows = await rest(`published_experiences?select=id,approved_headline,approved_summary,broad_function,broad_region,approximate_tenure,work_arrangement,main_reason,would_join_again,published_at,company_display_name&id=eq.${encodeURIComponent(id)}&limit=1`);
    const story = rows[0];
    if (!story) throw new Error('Story not found');

    article.replaceChildren();
    const header = make('header', 'story-title-block');
    const text = document.createElement('div');
    const meta = make('div', 'story-meta');
    meta.append(make('span', 'chip', 'Published contributor perspective'), make('span', 'chip', 'One perspective'));
    text.append(meta, make('h1', '', story.approved_headline || 'A workplace experience'));
    text.append(make('p', 'summary', story.approved_summary || 'This contributor-approved story is part of the CorporateX archive.'));
    header.append(text);
    article.append(header);

    const context = make('section', 'story-section');
    context.append(make('small', '', 'STORY CONTEXT'));
    context.append(make('h2', '', story.company_display_name || 'Employer context'));
    context.append(make('p', '', [story.broad_function, story.approximate_tenure, story.broad_region, story.work_arrangement].filter(Boolean).join(' · ') || 'Contributor-selected broad context.'));
    article.append(context);

    const summarySection = make('section', 'story-section');
    summarySection.append(make('small', '', 'THE ACCOUNT'));
    summarySection.append(make('h2', '', 'What the contributor approved for publication'));
    summarySection.append(make('p', '', story.approved_summary || 'No additional public summary was provided.'));
    article.append(summarySection);

    if (story.main_reason) {
      const reason = make('section', 'story-section');
      reason.append(make('small', '', 'PRIMARY SIGNAL'), make('h2', '', story.main_reason));
      article.append(reason);
    }
  } catch (error) {
    article.replaceChildren(make('h1', '', 'Story unavailable'), make('p', 'summary', 'This published story could not be loaded. Return to Stories and try again.'));
    console.error(error);
  }
}

mountUnifiedHeader();
rewriteProductionLinks();
addAnimePresence();
refreshActiveNavigation();
window.addEventListener('hashchange', refreshActiveNavigation);
hydrateStoriesPage();
hydrateStoryDetail();
