const body = document.body;
const page = body.dataset.page || '';

document.querySelectorAll('[data-nav]').forEach((link) => {
  if (link.dataset.nav === page) link.setAttribute('aria-current', 'page');
});

const toast = document.querySelector('.toast');
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 4200);
}

document.querySelectorAll('[data-signin]').forEach((button) => {
  button.addEventListener('click', () => showToast('Sign-in will be added later. The current beta experience is open to everyone.'));
});

const menuButton = document.querySelector('[data-menu-button]');
const mobilePanel = document.querySelector('[data-mobile-panel]');
if (menuButton && mobilePanel) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    mobilePanel.hidden = isOpen;
  });
  mobilePanel.addEventListener('click', () => {
    mobilePanel.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
  });
}

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('pointermove', (event) => {
    document.documentElement.style.setProperty('--mx', `${event.clientX}px`);
    document.documentElement.style.setProperty('--my', `${event.clientY}px`);
  }, { passive: true });
}

const themeMap = {
  growth: ['Career growth', 'Learning / skill stagnation', 'Better opportunity', 'Role change', 'Lack of recognition'],
  leadership: ['Manager / leadership', 'Leadership trust', 'Team conflict', 'Work culture', 'Values mismatch', 'Harassment / discrimination'],
  wellbeing: ['Workload', 'Burnout', 'Work-life balance', 'Performance pressure', 'Health / wellbeing', 'Remote / hybrid mismatch'],
  change: ['Layoff / restructuring', 'Job security', 'Role drift', 'Lack of clarity', 'Layoff fear'],
  compensation: ['Compensation', 'Lack of recognition', 'Career opportunity', 'Performance pressure'],
  personal: ['Personal reasons', 'Family situation', 'Location / relocation constraints', 'Health reasons', 'Retirement'],
  ai: ['AI / automation impact', 'AI-driven role pressure', 'Role redesign', 'Productivity expectations', 'Learning opportunity'],
};

function selectStoryDoor(button, container = document) {
  container.querySelectorAll('.story-door').forEach((door) => door.classList.remove('is-selected'));
  button.classList.add('is-selected');
  const theme = button.dataset.theme;
  document.querySelectorAll('[data-selected-theme]').forEach((node) => {
    node.textContent = button.querySelector('h3')?.textContent || 'Your turning point';
  });
  const reasonPanel = document.querySelector('[data-reason-panel]');
  if (reasonPanel && themeMap[theme]) {
    reasonPanel.innerHTML = `<div class="reason-options">${themeMap[theme].map((reason) => `
      <label class="reason-option"><input type="checkbox" name="reasons" value="${reason}"><span>${reason}</span></label>`).join('')}</div>`;
  }
  try { localStorage.setItem('corporateExTheme', theme); } catch (_) {}
}

document.querySelectorAll('.story-door').forEach((door) => {
  door.addEventListener('click', () => selectStoryDoor(door));
  door.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectStoryDoor(door);
    }
  });
});

const storedTheme = (() => { try { return localStorage.getItem('corporateExTheme'); } catch (_) { return null; } })();
const initialDoor = document.querySelector(`.story-door[data-theme="${storedTheme}"]`) || document.querySelector('.story-door.is-selected');
if (initialDoor) selectStoryDoor(initialDoor);

const chapterPrompts = {
  beginning: ['The Beginning', 'Every story has a beginning. What drew you into this company?', 'The role, mission, people, promise, opportunity or moment that made joining feel right…'],
  promise: ['The Promise', 'What did you expect—or what were you led to believe would be true?', 'Growth, flexibility, support, ownership, stability, learning or a particular way of working…'],
  good: ['The Good Part', 'What genuinely worked in the beginning or remained valuable?', 'A strong team, meaningful work, a helpful manager, trust, learning or people you valued…'],
  shift: ['The Shift', 'When did the experience begin to change?', 'A new manager, a missed promise, heavier workload, reorganisation, policy change or slow pattern…'],
  tipping: ['The Tipping Point', 'What made leaving feel necessary rather than optional?', 'The final conversation, repeated pattern, personal limit, layoff, relocation or practical reality…'],
  lesson: ['The Lesson', 'What should a future candidate ask before joining?', 'Offer one question that could reveal what the job description cannot…'],
  fit: ['The Right Fit', 'Could someone still thrive there under particular conditions?', 'The employer may suit someone who values…, joins a certain team, or is at a particular career stage…'],
  ai: ['The AI Chapter', 'Did AI, automation or productivity expectations change the work?', 'AI may have removed repetitive work, increased output expectations, changed roles, enabled learning—or had no impact…'],
};

const chapterButtons = [...document.querySelectorAll('[data-chapter]')];
const chapterEditor = document.querySelector('[data-chapter-editor]');
const chapterTitle = document.querySelector('[data-chapter-title]');
const chapterPrompt = document.querySelector('[data-chapter-prompt]');
const chapterTextarea = document.querySelector('[data-chapter-text]');
const chapterCounter = document.querySelector('[data-chapter-count]');
let activeChapter = 'beginning';
const chapterValues = {};
try { Object.assign(chapterValues, JSON.parse(localStorage.getItem('corporateExGuidedChapters') || '{}')); } catch (_) {}

function openChapter(id) {
  if (!chapterPrompts[id] || !chapterEditor) return;
  if (chapterTextarea) chapterValues[activeChapter] = chapterTextarea.value;
  activeChapter = id;
  chapterButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.chapter === id));
  const [title, prompt, placeholder] = chapterPrompts[id];
  chapterTitle.textContent = title;
  chapterPrompt.textContent = prompt;
  chapterTextarea.placeholder = placeholder;
  chapterTextarea.value = chapterValues[id] || '';
  chapterCounter.textContent = String(chapterTextarea.value.length);
}
chapterButtons.forEach((button) => button.addEventListener('click', () => openChapter(button.dataset.chapter)));
if (chapterTextarea) {
  chapterTextarea.addEventListener('input', () => {
    chapterValues[activeChapter] = chapterTextarea.value;
    chapterCounter.textContent = String(chapterTextarea.value.length);
  });
  openChapter('beginning');
}

function collectFormData(form) {
  const data = new FormData(form);
  const object = {};
  for (const [key, value] of data.entries()) {
    if (object[key]) object[key] = Array.isArray(object[key]) ? [...object[key], value] : [object[key], value];
    else object[key] = value;
  }
  return object;
}

document.querySelectorAll('[data-save-draft]').forEach((button) => {
  button.addEventListener('click', () => {
    const form = button.closest('form');
    const key = form?.dataset.storageKey || 'corporateExDraft';
    if (chapterTextarea) chapterValues[activeChapter] = chapterTextarea.value;
    try {
      localStorage.setItem(key, JSON.stringify(collectFormData(form)));
      if (form?.classList.contains('guided-form')) localStorage.setItem('corporateExGuidedChapters', JSON.stringify(chapterValues));
      showToast('Your private draft has been saved in this browser. Nothing has been published.');
    } catch (_) {
      showToast('This browser could not save the draft. Copy your text before leaving the page.');
    }
  });
});

document.querySelectorAll('form[data-storage-key]').forEach((form) => {
  try {
    const saved = JSON.parse(localStorage.getItem(form.dataset.storageKey) || '{}');
    Object.entries(saved).forEach(([key, value]) => {
      const values = Array.isArray(value) ? value : [value];
      form.querySelectorAll(`[name="${CSS.escape(key)}"]`).forEach((field) => {
        if (field.type === 'checkbox' || field.type === 'radio') field.checked = values.includes(field.value);
        else if (values[0] != null) field.value = values[0];
      });
    });
  } catch (_) {}
});

document.querySelectorAll('textarea[data-counter]').forEach((textarea) => {
  const counter = document.querySelector(`[data-count-for="${textarea.id}"]`);
  const update = () => { if (counter) counter.textContent = String(textarea.value.length); };
  textarea.addEventListener('input', update); update();
});

document.querySelectorAll('[data-submit-form]').forEach((form) => {
  const checks = [...form.querySelectorAll('[data-confirm]')];
  const submit = form.querySelector('[data-final-submit]');
  const update = () => { if (submit) submit.disabled = checks.some((check) => !check.checked); };
  checks.forEach((check) => check.addEventListener('change', update));
  update();
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (checks.some((check) => !check.checked)) return;
    const key = form.dataset.storageKey || 'corporateExDraft';
    try { localStorage.setItem(key, JSON.stringify(collectFormData(form))); } catch (_) {}
    showToast('Story review is ready in this prototype. No public submission has been sent yet.');
  });
});

const storySearch = document.querySelector('[data-story-search]');
const companyGroups = [...document.querySelectorAll('[data-company-group]')];
const filterButtons = [...document.querySelectorAll('[data-theme-filter]')];
let activeFilter = 'all';
function filterStories() {
  const query = (storySearch?.value || '').trim().toLowerCase();
  let visibleGroups = 0;
  companyGroups.forEach((group) => {
    let visibleRows = 0;
    group.querySelectorAll('[data-story-row]').forEach((row) => {
      const matchesQuery = !query || row.textContent.toLowerCase().includes(query) || group.dataset.company.toLowerCase().includes(query);
      const matchesTheme = activeFilter === 'all' || row.dataset.theme === activeFilter;
      const visible = matchesQuery && matchesTheme;
      row.hidden = !visible;
      if (visible) visibleRows += 1;
    });
    group.hidden = visibleRows === 0;
    if (visibleRows) { visibleGroups += 1; group.open = true; }
  });
  const empty = document.querySelector('[data-empty-state]');
  if (empty) empty.style.display = visibleGroups ? 'none' : 'block';
}
storySearch?.addEventListener('input', filterStories);
filterButtons.forEach((button) => button.addEventListener('click', () => {
  activeFilter = button.dataset.themeFilter;
  filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
  filterStories();
}));

document.querySelectorAll('[data-cloud-theme]').forEach((link) => {
  link.addEventListener('click', () => {
    try { localStorage.setItem('corporateExStoryFilter', link.dataset.cloudTheme); } catch (_) {}
  });
});
try {
  const requestedFilter = localStorage.getItem('corporateExStoryFilter');
  if (requestedFilter && page === 'stories') {
    const filter = document.querySelector(`[data-theme-filter="${CSS.escape(requestedFilter)}"]`);
    if (filter) filter.click();
    localStorage.removeItem('corporateExStoryFilter');
  }
} catch (_) {}

import('./site-upgrades.js').catch(() => {
  // The core prototype remains usable if an optional quality module fails to load.
});
