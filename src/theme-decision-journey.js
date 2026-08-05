import { THEME_DECISION_CARDS } from './theme-decision-data.js';
import {
  completedThemeCount,
  createThemeDecisionState,
  isThemeJourneyComplete,
  markCurrentViewed,
  moveToThemeCard,
  restartThemeJourney,
  setThemeCardStatus,
  summarizeThemeDecisions,
} from './theme-decision-state.js';

const pageName = location.pathname.split('/').pop() || '';
const isStoryPage = ['guided-story.html', 'freeflow-story.html'].includes(pageName);

if (isStoryPage) {
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'src/theme-decision-journey.css';
  document.head.append(style);

  const section = [...document.querySelectorAll('.form-section')]
    .find((candidate) => candidate.querySelector('.story-door-stage'));

  if (section) mountThemeDecisionJourney(section);
}

function mountThemeDecisionJourney(section) {
  const isFreeflow = pageName === 'freeflow-story.html';
  section.className = 'form-section theme-decision-section';
  section.dataset.themeJourney = '';
  section.innerHTML = `
    <header class="theme-decision-heading">
      <div>
        <p class="eyebrow">${isFreeflow ? 'OPTIONAL THEMES' : 'THE TURNING POINT'}</p>
        <h2>${isFreeflow ? 'Choose what belongs—or skip it.' : 'Find the chapters that shaped your exit.'}</h2>
      </div>
      <p>One card at a time. Select what fits, ignore what does not, or leave it for later.</p>
    </header>
    <div class="theme-decision-root" data-theme-decision-root></div>`;

  const root = section.querySelector('[data-theme-decision-root]');
  let state = createThemeDecisionState(THEME_DECISION_CARDS);
  let advanceTimer = 0;

  const clearAdvanceTimer = () => {
    window.clearTimeout(advanceTimer);
    advanceTimer = 0;
  };

  const announce = (message) => {
    const live = root.querySelector('[data-theme-live]');
    if (!live) return;
    live.textContent = '';
    requestAnimationFrame(() => { live.textContent = message; });
  };

  const nextUnansweredIndex = () => {
    const after = state.cards.findIndex((card, index) => index > state.currentIndex && ['unseen', 'viewed', 'skipped'].includes(card.status));
    if (after >= 0) return after;
    return state.cards.findIndex((card) => ['unseen', 'viewed', 'skipped'].includes(card.status));
  };

  const goTo = (index, options = {}) => {
    clearAdvanceTimer();
    state = moveToThemeCard(state, index, options);
    render();
    requestAnimationFrame(() => root.querySelector('[data-flip-card]')?.focus());
  };

  const showSummary = () => {
    clearAdvanceTimer();
    state = { ...state, showingSummary: true, isFlipped: false };
    render();
    requestAnimationFrame(() => root.querySelector('[data-summary-title]')?.focus());
  };

  const advance = () => {
    if (isThemeJourneyComplete(state)) {
      showSummary();
      return;
    }
    const nextIndex = nextUnansweredIndex();
    if (nextIndex >= 0) goTo(nextIndex, { markUnansweredSkipped: false });
    else showSummary();
  };

  const decide = (status) => {
    clearAdvanceTimer();
    const current = state.cards[state.currentIndex];
    state = setThemeCardStatus(state, current.id, status);
    render();
    const label = status === 'selected' ? 'selected' : status === 'ignored' ? 'ignored' : 'left for later';
    announce(`${current.theme} ${label}. Moving to the next card.`);
    advanceTimer = window.setTimeout(advance, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 480);
  };

  const flip = () => {
    clearAdvanceTimer();
    state = markCurrentViewed(state);
    render();
    announce(`${state.cards[state.currentIndex].theme} revealed.`);
    requestAnimationFrame(() => root.querySelector('[data-select-card]')?.focus());
  };

  const returnToFront = () => {
    if (!state.isFlipped) return;
    state = { ...state, isFlipped: false };
    render();
    requestAnimationFrame(() => root.querySelector('[data-flip-card]')?.focus());
  };

  const confirmThemes = () => {
    const selected = summarizeThemeDecisions(state).selected;
    state = { ...state, confirmed: true };
    render();
    announce(`${selected.length} selected theme${selected.length === 1 ? '' : 's'} confirmed for this session.`);
    section.closest('form')?.dispatchEvent(new CustomEvent('themejourneyconfirmed', {
      bubbles: true,
      detail: { selected: selected.map(({ id, theme }) => ({ id, theme })) },
    }));
  };

  const renderPreview = (card, direction) => {
    if (!card) return `<div class="theme-card-preview is-empty" aria-hidden="true"><small>${direction}</small><strong>Summary</strong></div>`;
    return `<div class="theme-card-preview" aria-hidden="true"><small>${direction} · Card ${card.number}</small><strong>${card.theme}</strong><span>${card.icon}</span></div>`;
  };

  const renderIndex = () => state.cards.map((card, index) => `
    <button type="button" class="theme-index-button status-${card.status}${index === state.currentIndex ? ' is-current' : ''}"
      data-jump-card="${index}" aria-label="Open card ${card.number}: ${card.theme}. Status: ${card.status}."
      aria-current="${index === state.currentIndex ? 'step' : 'false'}">
      <span>${card.number}</span><small>${card.status === 'unseen' ? '—' : card.status.slice(0, 1).toUpperCase()}</small>
    </button>`).join('');

  const renderSelectedTray = (summary) => `
    <aside class="theme-selection-tray" aria-label="Selected theme summary">
      <div class="theme-tray-heading"><strong>Selected themes</strong><span>${summary.selected.length}</span></div>
      <div class="theme-tray-list">
        ${summary.selected.length ? summary.selected.map((card) => `<button type="button" data-edit-card="${card.number - 1}">${card.theme}</button>`).join('') : '<p>Selected cards will stay visible here.</p>'}
      </div>
    </aside>`;

  const renderCard = (current) => `
    <article class="theme-flip-card status-${current.status}${state.isFlipped ? ' is-flipped' : ''}" aria-label="Card ${current.number} of ${state.cards.length}: ${current.theme}">
      <div class="theme-flip-inner">
        <button type="button" class="theme-card-face theme-card-front" data-flip-card
          aria-expanded="${state.isFlipped}" aria-label="Reveal card ${current.number}: ${current.theme}">
          <span class="theme-card-number">Card ${current.number}</span>
          <span class="theme-card-illustration" aria-hidden="true">
            <svg viewBox="0 0 400 500" focusable="false"><use href="public/story-scenes.svg#${current.scene}"></use></svg>
          </span>
          <span class="theme-card-icon" aria-hidden="true">${current.icon}</span>
          <span class="theme-card-copy"><strong>${current.theme}</strong><span>${current.teaser}</span></span>
          <span class="theme-reveal-instruction">Click to reveal <b aria-hidden="true">↻</b></span>
        </button>
        <div class="theme-card-face theme-card-back" aria-hidden="${!state.isFlipped}">
          <div class="theme-card-back-copy">
            <small>Card ${current.number} · ${current.status === 'viewed' ? 'Make a choice' : `Currently ${current.status}`}</small>
            <h3>${current.theme}</h3>
            <p>${current.context}</p>
            <blockquote>${current.example}</blockquote>
          </div>
          <div class="theme-card-actions" aria-label="Choose a status for ${current.theme}">
            <button type="button" class="theme-action select" data-select-card aria-pressed="${current.status === 'selected'}">${current.status === 'selected' ? 'Selected ✓' : 'Select'}</button>
            <button type="button" class="theme-action ignore" data-ignore-card aria-pressed="${current.status === 'ignored'}">${current.status === 'ignored' ? 'Ignored ✓' : 'Ignore'}</button>
            <button type="button" class="theme-action skip" data-skip-card>Skip to next card</button>
          </div>
          <p class="theme-up-next"><span>Up next:</span> ${current.nextCardName}</p>
        </div>
      </div>
    </article>`;

  const renderSummaryGroup = (title, cards, className, actionLabel = 'Edit choice') => `
    <section class="theme-summary-group ${className}">
      <h4>${title} <span>${cards.length}</span></h4>
      ${cards.length ? `<div>${cards.map((card) => `<article><span>${card.icon}</span><div><strong>${card.theme}</strong><p>${card.teaser}</p></div><button type="button" data-edit-card="${card.number - 1}">${actionLabel}</button></article>`).join('')}</div>` : '<p>None yet.</p>'}
    </section>`;

  const renderSummary = (summary) => `
    <section class="theme-final-summary" aria-labelledby="theme-summary-title">
      <p class="eyebrow">YOUR THEME SUMMARY</p>
      <h3 id="theme-summary-title" data-summary-title tabindex="-1">Keep what belongs in your story.</h3>
      <p>Every choice can still be changed. Nothing has been saved beyond this page session.</p>
      ${renderSummaryGroup('Selected themes', summary.selected, 'selected-themes')}
      ${renderSummaryGroup('Ignored themes', summary.ignored, 'ignored-themes')}
      ${renderSummaryGroup('Skipped themes', summary.skipped, 'skipped-themes', 'Review card')}
      <div class="theme-summary-actions">
        <button type="button" class="button button-primary" data-confirm-themes>${state.confirmed ? 'Themes confirmed ✓' : 'Confirm selected themes'}</button>
        <button type="button" class="button button-secondary" data-edit-choices>Edit my choices</button>
        ${summary.skipped.length ? '<button type="button" class="button button-secondary" data-review-skipped>Review skipped cards</button>' : ''}
        <button type="button" class="button button-ghost" data-restart-journey>Start again</button>
      </div>
    </section>`;

  function render() {
    const current = state.cards[state.currentIndex];
    const summary = summarizeThemeDecisions(state);
    const completed = completedThemeCount(state);
    const previous = state.currentIndex > 0 ? state.cards[state.currentIndex - 1] : null;
    const next = state.currentIndex < state.cards.length - 1 ? state.cards[state.currentIndex + 1] : null;

    root.innerHTML = `
      <div class="theme-decision-toolbar">
        <div class="theme-progress-copy">
          <strong>Card ${current.number} of ${state.cards.length}</strong>
          <span>${completed} of ${state.cards.length} completed · ${summary.selected.length} selected · ${summary.ignored.length} ignored · ${summary.skipped.length} skipped</span>
        </div>
        <progress max="${state.cards.length}" value="${completed}" aria-label="Theme journey progress: ${completed} of ${state.cards.length} completed"></progress>
        <button type="button" class="theme-restart-link" data-restart-journey>Restart</button>
      </div>
      <nav class="theme-card-index" aria-label="Revisit a theme card">${renderIndex()}</nav>
      ${state.showingSummary ? renderSummary(summary) : `
        <div class="theme-decision-layout">
          ${renderPreview(previous, 'Previous')}
          <div class="theme-stage">
            ${renderCard(current)}
            <nav class="theme-sequence-nav" aria-label="Move through theme cards">
              <button type="button" data-previous-card ${state.currentIndex === 0 ? 'disabled' : ''}>← Previous</button>
              <button type="button" data-next-card>${state.currentIndex === state.cards.length - 1 ? 'Finish journey' : 'Next card →'}</button>
            </nav>
          </div>
          ${renderPreview(next, 'Up next')}
          ${renderSelectedTray(summary)}
        </div>`}
      <p class="sr-only" aria-live="polite" aria-atomic="true" data-theme-live></p>`;

    bindInteractions();
  }

  function bindInteractions() {
    root.querySelector('[data-flip-card]')?.addEventListener('click', flip);
    root.querySelector('[data-select-card]')?.addEventListener('click', () => decide('selected'));
    root.querySelector('[data-ignore-card]')?.addEventListener('click', () => decide('ignored'));
    root.querySelector('[data-skip-card]')?.addEventListener('click', () => decide('skipped'));

    root.querySelector('[data-previous-card]')?.addEventListener('click', () => goTo(state.currentIndex - 1));
    root.querySelector('[data-next-card]')?.addEventListener('click', () => {
      if (state.currentIndex === state.cards.length - 1) {
        state = moveToThemeCard(state, state.currentIndex);
        if (isThemeJourneyComplete(state)) showSummary();
        else advance();
        return;
      }
      goTo(state.currentIndex + 1);
    });

    root.querySelectorAll('[data-jump-card], [data-edit-card]').forEach((button) => {
      const index = Number(button.dataset.jumpCard ?? button.dataset.editCard);
      button.addEventListener('click', () => goTo(index));
    });

    root.querySelectorAll('[data-restart-journey]').forEach((button) => button.addEventListener('click', () => {
      clearAdvanceTimer();
      state = restartThemeJourney(state);
      render();
      announce('Theme journey restarted.');
      requestAnimationFrame(() => root.querySelector('[data-flip-card]')?.focus());
    }));

    root.querySelector('[data-confirm-themes]')?.addEventListener('click', confirmThemes);
    root.querySelector('[data-edit-choices]')?.addEventListener('click', () => goTo(0, { markUnansweredSkipped: false }));
    root.querySelector('[data-review-skipped]')?.addEventListener('click', () => {
      const skippedIndex = state.cards.findIndex((card) => card.status === 'skipped');
      if (skippedIndex >= 0) goTo(skippedIndex, { markUnansweredSkipped: false });
    });
  }

  root.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (state.currentIndex > 0) goTo(state.currentIndex - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (state.currentIndex < state.cards.length - 1) goTo(state.currentIndex + 1);
      else if (isThemeJourneyComplete(state)) showSummary();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      returnToFront();
    }
  });

  render();
}
