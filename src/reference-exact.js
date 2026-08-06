import {
  GUIDED_CHAPTERS,
  adjacentChapterId,
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
  if (!menuButton || !mobileNav) return;

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

function initialiseGuidedWorkflow() {
  const root = document.querySelector('[data-guided-workflow]');
  if (!root) return;

  const cards = [...root.querySelectorAll('[data-guided-chapter]')];
  const storyUi = [...root.querySelectorAll('[data-guided-story-ui]')];
  const stepMarkers = [...root.querySelectorAll('[data-guided-step-marker]')];
  const contextPanel = root.querySelector('[data-guided-context]');
  const contextNextButton = root.querySelector('[data-guided-context-next]');
  const editContextButton = root.querySelector('[data-guided-edit-context]');
  const companyField = root.querySelector('[data-guided-company]');
  const teamField = root.querySelector('[data-guided-team]');
  const locationField = root.querySelector('[data-guided-location]');
  const contextStatus = root.querySelector('[data-guided-context-status]');
  const dots = root.querySelector('[data-guided-dots]');
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
  let dotButtons = [];

  function setStep(step, { focus = false } = {}) {
    root.dataset.guidedStep = step;
    if (contextPanel) contextPanel.hidden = step !== 'context';
    storyUi.forEach((element) => { element.hidden = step !== 'story'; });
    if (review) review.hidden = step !== 'review';
    stepMarkers.forEach((marker) => {
      if (marker.dataset.guidedStepMarker === step) marker.setAttribute('aria-current', 'step');
      else marker.removeAttribute('aria-current');
    });
    const destination = step === 'context' ? contextPanel : step === 'review' ? review : root.querySelector('[data-guided-story-ui]');
    scrollToElement(destination);
    if (focus) {
      window.setTimeout(() => {
        if (step === 'context') companyField?.focus();
        else if (step === 'story') cards.find((card) => card.dataset.guidedChapter === state.activeId)?.focus();
        else review?.querySelector('h2')?.focus?.();
      }, reducedMotion ? 0 : 220);
    }
  }

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
    if (contextStatus) contextStatus.textContent = 'Add the highlighted story context before continuing.';
    setStep('context');
    (companyField?.matches('[aria-invalid="true"]') ? companyField : locationField)?.focus();
  }

  function updateContextStatus() {
    const validation = validateGuidedContext(state.context);
    if (!contextStatus) return;
    contextStatus.textContent = validation.valid
      ? `Context ready: ${validation.context.company} · ${validation.context.location}`
      : '';
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

  function createChapterDots() {
    if (!dots) return;
    dotButtons = GUIDED_CHAPTERS.map((chapter) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ref-chapter-dot';
      button.dataset.guidedDot = chapter.id;
      button.textContent = String(chapter.number);
      button.setAttribute('aria-label', `Open chapter ${chapter.number}: ${chapter.title}`);
      button.addEventListener('click', () => activateChapter(chapter.id, { focusEditor: true }));
      return button;
    });
    dots.replaceChildren(...dotButtons);
  }

  function renderProgressAndCards() {
    const progress = guidedProgress(state);
    const activeIndex = GUIDED_CHAPTERS.findIndex((chapter) => chapter.id === state.activeId);
    const previousId = activeIndex > 0 ? GUIDED_CHAPTERS[activeIndex - 1].id : null;
    const nextId = activeIndex < GUIDED_CHAPTERS.length - 1 ? GUIDED_CHAPTERS[activeIndex + 1].id : null;

    if (progressLabel) progressLabel.textContent = `Chapter ${activeIndex + 1} of ${progress.total}`;
    if (progressCounts) progressCounts.textContent = `${progress.answered} answered · ${progress.skipped} skipped`;
    if (progressFill) progressFill.style.width = `${progress.percent}%`;
    if (reviewButton) reviewButton.disabled = progress.answered === 0;

    cards.forEach((card) => {
      const id = card.dataset.guidedChapter;
      const status = chapterStatus(state, id);
      const active = id === state.activeId;
      const previous = id === previousId;
      const next = id === nextId;
      const visible = active || previous || next;
      card.hidden = !visible;
      card.tabIndex = visible ? 0 : -1;
      card.classList.toggle('is-active', active);
      card.classList.toggle('is-prev', previous);
      card.classList.toggle('is-next', next);
      card.classList.toggle('is-answered', status === 'answered');
      card.classList.toggle('is-skipped', status === 'skipped');
      card.setAttribute('aria-pressed', String(active));
      card.dataset.status = status;
      const statusLabel = card.querySelector('[data-card-status]');
      if (statusLabel) statusLabel.textContent = status === 'answered' ? 'Answered' : status === 'skipped' ? 'Skipped' : 'Open chapter';
    });

    dotButtons.forEach((button) => {
      const id = button.dataset.guidedDot;
      button.setAttribute('aria-pressed', String(id === state.activeId));
      button.dataset.status = chapterStatus(state, id);
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

  function activateChapter(id, { focusEditor = false } = {}) {
    state = setActiveChapter(state, id);
    renderEditor();
    if (focusEditor) {
      scrollToElement(editor);
      window.setTimeout(() => textarea?.focus(), reducedMotion ? 0 : 220);
    }
  }

  cards.forEach((card) => {
    card.addEventListener('click', () => activateChapter(card.dataset.guidedChapter, { focusEditor: true }));
    card.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const id = adjacentChapterId(state.activeId, event.key === 'ArrowRight' ? 1 : -1);
      activateChapter(id);
      window.setTimeout(() => cards.find((item) => item.dataset.guidedChapter === id)?.focus(), 0);
    });
  });

  textarea?.addEventListener('input', () => {
    state = setGuidedResponse(state, state.activeId, textarea.value);
    if (counter) counter.textContent = String(textarea.value.length);
    if (live) live.textContent = textarea.value.trim() ? 'Response kept for this page visit.' : '';
    renderProgressAndCards();
  });

  contextNextButton?.addEventListener('click', () => {
    const result = validateGuidedContext(state.context);
    if (!result.valid) {
      showContextValidation(result);
      return;
    }
    clearContextValidation();
    setStep('story', { focus: true });
    renderEditor();
  });

  editContextButton?.addEventListener('click', () => setStep('context', { focus: true }));
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
    if (agreement) agreement.checked = false;
    if (confirmButton) confirmButton.disabled = true;
    setStep('review');
  });

  reviewList?.addEventListener('click', (event) => {
    const edit = event.target.closest('[data-edit-chapter]');
    if (!edit) return;
    setStep('story');
    activateChapter(edit.dataset.editChapter, { focusEditor: true });
  });

  editChoicesButton?.addEventListener('click', () => {
    setStep('story', { focus: true });
  });

  agreement?.addEventListener('change', () => {
    if (confirmButton) confirmButton.disabled = !agreement.checked;
  });

  confirmButton?.addEventListener('click', () => {
    const submission = buildGuidedSubmission(state);
    if (!agreement?.checked || !submission.valid || submission.progress.answered === 0) return;
    root.dispatchEvent(new CustomEvent('guidedstoryconfirmed', { bubbles: true, detail: submission }));
    showToast('Your CorporateX story is ready for the future safety review. Nothing has been uploaded or published.');
  });

  createChapterDots();
  renderEditor();
  updateContextStatus();
  setStep('context');
}

initialiseShell();
initialiseGuidedWorkflow();
