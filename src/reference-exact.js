import {
  GUIDED_CHAPTERS,
  adjacentChapterId,
  buildGuidedReview,
  buildGuidedSubmission,
  chapterStatus,
  createGuidedState,
  getChapter,
  guidedProgress,
  markGuidedSkipped,
  setActiveChapter,
  setGuidedContext,
  setGuidedResponse,
  validateGuidedContext,
} from './story-workflow-model.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const toast = document.querySelector('.ref-toast');

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 3600);
}

function scrollToElement(element) {
  element?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start', inline: 'nearest' });
}

function initialiseShell() {
  const page = document.body.dataset.refPage;
  document.querySelectorAll('[data-ref-nav]').forEach((link) => {
    if (link.dataset.refNav === page) link.setAttribute('aria-current', 'page');
  });

  const menuButton = document.querySelector('[data-ref-menu]');
  const mobileNav = document.querySelector('[data-ref-mobile-nav]');
  if (menuButton && mobileNav) {
    if (!mobileNav.id) mobileNav.id = 'mobile-navigation';
    menuButton.setAttribute('aria-controls', mobileNav.id);
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      mobileNav.hidden = open;
    });
    mobileNav.addEventListener('click', (event) => {
      if (!event.target.closest('a,button')) return;
      mobileNav.hidden = true;
      menuButton.setAttribute('aria-expanded', 'false');
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !mobileNav.hidden) {
        mobileNav.hidden = true;
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.focus();
      }
    });
  }

  document.querySelectorAll('[data-ref-signin]').forEach((button) => {
    button.addEventListener('click', () => {
      showToast('Sign in will be added later. The current experience is open to everyone.');
    });
  });
}

function initialiseGuidedWorkflow() {
  const root = document.querySelector('[data-guided-workflow]');
  if (!root) return;

  const cards = [...root.querySelectorAll('[data-guided-chapter]')];
  const contextPanel = root.querySelector('[data-guided-context]');
  const companyField = root.querySelector('[data-guided-company]');
  const teamField = root.querySelector('[data-guided-team]');
  const locationField = root.querySelector('[data-guided-location]');
  const contextStatus = root.querySelector('[data-guided-context-status]');
  const editor = root.querySelector('[data-guided-editor]');
  const review = root.querySelector('[data-guided-review-panel]');
  const textarea = root.querySelector('[data-guided-text]');
  const title = root.querySelector('[data-guided-title]');
  const prompt = root.querySelector('[data-guided-prompt]');
  const helper = root.querySelector('[data-guided-helper]');
  const position = root.querySelector('[data-guided-position]');
  const counter = root.querySelector('[data-guided-count]');
  const progressLabel = root.querySelector('[data-guided-progress-label]');
  const progressCounts = root.querySelector('[data-guided-progress-counts]');
  const progressFill = root.querySelector('[data-guided-progress-fill]');
  const live = root.querySelector('[data-guided-live]');
  const previousButton = root.querySelector('[data-guided-previous]');
  const nextButton = root.querySelector('[data-guided-next]');
  const skipButton = root.querySelector('[data-guided-skip]');
  const reviewButton = root.querySelector('[data-guided-review]');
  const reviewList = root.querySelector('[data-guided-review-list]');
  const editChoicesButton = root.querySelector('[data-guided-edit-choices]');
  const agreement = root.querySelector('[data-guided-agreement]');
  const confirmButton = root.querySelector('[data-guided-confirm]');
  let state = createGuidedState();

  function clearContextValidation() {
    [companyField, locationField].forEach((field) => field?.removeAttribute('aria-invalid'));
    root.querySelectorAll('[data-guided-error]').forEach((node) => { node.textContent = ''; });
  }

  function showContextValidation(result) {
    clearContextValidation();
    Object.entries(result.errors).forEach(([name, message]) => {
      const field = name === 'company' ? companyField : locationField;
      field?.setAttribute('aria-invalid', 'true');
      const error = root.querySelector(`[data-guided-error="${name}"]`);
      if (error) error.textContent = message;
    });
    if (contextStatus) contextStatus.textContent = 'Add the highlighted story context before review.';
    scrollToElement(contextPanel);
    (companyField?.matches('[aria-invalid="true"]') ? companyField : locationField)?.focus();
  }

  function updateContextStatus() {
    const validation = validateGuidedContext(state.context);
    if (contextStatus) {
      contextStatus.textContent = validation.valid
        ? `Context ready: ${validation.context.company} · ${validation.context.location}`
        : '';
    }
  }

  [
    [companyField, 'company'],
    [teamField, 'team'],
    [locationField, 'location'],
  ].forEach(([field, name]) => {
    field?.addEventListener('input', () => {
      state = setGuidedContext(state, name, field.value);
      field.removeAttribute('aria-invalid');
      const error = root.querySelector(`[data-guided-error="${name}"]`);
      if (error) error.textContent = '';
      updateContextStatus();
    });
  });

  function renderProgressAndCards() {
    const progress = guidedProgress(state);
    const activeIndex = GUIDED_CHAPTERS.findIndex((chapter) => chapter.id === state.activeId);
    if (progressLabel) progressLabel.textContent = `Chapter ${activeIndex + 1} of ${progress.total}`;
    if (progressCounts) progressCounts.textContent = `${progress.answered} answered · ${progress.skipped} skipped`;
    if (progressFill) progressFill.style.width = `${progress.percent}%`;
    if (reviewButton) reviewButton.disabled = progress.answered === 0;

    cards.forEach((card) => {
      const id = card.dataset.guidedChapter;
      const status = chapterStatus(state, id);
      const active = id === state.activeId;
      card.classList.toggle('is-active', active);
      card.classList.toggle('is-answered', status === 'answered');
      card.classList.toggle('is-skipped', status === 'skipped');
      card.setAttribute('aria-pressed', String(active));
      card.dataset.status = status;
      const statusLabel = card.querySelector('[data-card-status]');
      if (statusLabel) statusLabel.textContent = status === 'answered' ? 'Answered' : status === 'skipped' ? 'Skipped' : 'Open chapter';
    });
  }

  function renderEditor() {
    const chapter = getChapter(state.activeId);
    if (!chapter) return;
    if (title) title.textContent = chapter.title;
    if (prompt) prompt.textContent = chapter.prompt;
    if (helper) helper.textContent = chapter.helper;
    if (position) position.textContent = `${chapter.number} / ${GUIDED_CHAPTERS.length}`;
    if (textarea) {
      textarea.value = state.responses[chapter.id] || '';
      textarea.placeholder = chapter.placeholder;
      textarea.setAttribute('aria-label', `${chapter.title}: ${chapter.prompt}`);
    }
    if (counter) counter.textContent = String((state.responses[chapter.id] || '').length);
    if (previousButton) previousButton.disabled = chapter.number === 1;
    if (nextButton) nextButton.disabled = chapter.number === GUIDED_CHAPTERS.length;
    if (skipButton) skipButton.textContent = chapter.number === GUIDED_CHAPTERS.length ? 'Skip chapter' : 'Skip & next';
    renderProgressAndCards();
  }

  function activateChapter(id, { focusEditor = false, centreCard = true } = {}) {
    state = setActiveChapter(state, id);
    renderEditor();
    const activeCard = cards.find((card) => card.dataset.guidedChapter === id);
    if (centreCard && window.innerWidth < 1280) {
      activeCard?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
    }
    if (focusEditor) {
      scrollToElement(editor);
      window.setTimeout(() => textarea?.focus(), reducedMotion ? 0 : 260);
    }
  }

  cards.forEach((card, index) => {
    card.addEventListener('click', () => activateChapter(card.dataset.guidedChapter, { focusEditor: true }));
    card.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const targetIndex = Math.min(cards.length - 1, Math.max(0, index + (event.key === 'ArrowRight' ? 1 : -1)));
      cards[targetIndex].focus();
      activateChapter(cards[targetIndex].dataset.guidedChapter, { centreCard: true });
    });
  });

  textarea?.addEventListener('input', () => {
    state = setGuidedResponse(state, state.activeId, textarea.value);
    if (counter) counter.textContent = String(textarea.value.length);
    if (live) live.textContent = textarea.value.trim() ? 'Response kept for this page visit.' : '';
    renderProgressAndCards();
  });

  previousButton?.addEventListener('click', () => activateChapter(adjacentChapterId(state.activeId, -1), { focusEditor: true }));
  nextButton?.addEventListener('click', () => activateChapter(adjacentChapterId(state.activeId, 1), { focusEditor: true }));
  skipButton?.addEventListener('click', () => {
    state = markGuidedSkipped(state, state.activeId);
    renderProgressAndCards();
    const nextId = adjacentChapterId(state.activeId, 1);
    if (nextId !== state.activeId) activateChapter(nextId, { focusEditor: true });
    else if (live) live.textContent = 'Chapter marked as skipped. You can return to it at any time.';
  });

  function renderReview() {
    if (!reviewList) return;
    const submission = buildGuidedSubmission(state);
    Object.entries(submission.context).forEach(([name, value]) => {
      const node = review?.querySelector(`[data-guided-review-context="${name}"]`);
      if (node) node.textContent = value || 'Not provided';
    });
    reviewList.replaceChildren(...submission.chapters.map((item) => {
      const article = document.createElement('article');
      article.className = 'ref-review-item';
      const heading = document.createElement('h3');
      heading.textContent = `${item.number}. ${item.title}`;
      const response = document.createElement('p');
      response.textContent = item.response || (item.status === 'skipped' ? 'Skipped for now.' : 'Not answered yet.');
      if (!item.response) response.classList.add('ref-empty');
      const edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'ref-review-edit';
      edit.dataset.editChapter = item.id;
      edit.textContent = 'Edit';
      article.append(heading, response, edit);
      return article;
    }));
  }

  reviewButton?.addEventListener('click', () => {
    const contextValidation = validateGuidedContext(state.context);
    if (!contextValidation.valid) {
      showContextValidation(contextValidation);
      return;
    }
    clearContextValidation();
    renderReview();
    if (editor) editor.hidden = true;
    if (contextPanel) contextPanel.hidden = true;
    if (review) review.hidden = false;
    if (agreement) agreement.checked = false;
    if (confirmButton) confirmButton.disabled = true;
    scrollToElement(review);
  });

  reviewList?.addEventListener('click', (event) => {
    const edit = event.target.closest('[data-edit-chapter]');
    if (!edit) return;
    if (review) review.hidden = true;
    if (contextPanel) contextPanel.hidden = false;
    if (editor) editor.hidden = false;
    activateChapter(edit.dataset.editChapter, { focusEditor: true });
  });

  editChoicesButton?.addEventListener('click', () => {
    if (review) review.hidden = true;
    if (contextPanel) contextPanel.hidden = false;
    if (editor) editor.hidden = false;
    scrollToElement(contextPanel);
  });

  agreement?.addEventListener('change', () => {
    if (confirmButton) confirmButton.disabled = !agreement.checked;
  });

  confirmButton?.addEventListener('click', () => {
    const submission = buildGuidedSubmission(state);
    if (!agreement?.checked || !submission.valid || submission.progress.answered === 0) return;
    root.dispatchEvent(new CustomEvent('guidedstoryconfirmed', { bubbles: true, detail: submission }));
    showToast('Your guided story is ready for the future moderation workflow. Nothing has been published.');
  });

  renderEditor();
}

initialiseShell();
initialiseGuidedWorkflow();
