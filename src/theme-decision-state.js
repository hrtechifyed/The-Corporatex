import { THEME_DECISION_STATUSES } from './theme-decision-data.js';

const DECISION_STATUSES = new Set(THEME_DECISION_STATUSES);

export function createThemeDecisionState(cards) {
  return {
    currentIndex: 0,
    isFlipped: false,
    showingSummary: false,
    confirmed: false,
    cards: cards.map((card) => ({ ...card, status: 'unseen' })),
  };
}

export function setThemeCardStatus(state, cardId, status) {
  if (!DECISION_STATUSES.has(status)) throw new TypeError(`Unsupported theme status: ${status}`);
  return {
    ...state,
    confirmed: false,
    cards: state.cards.map((card) => card.id === cardId ? { ...card, status } : card),
  };
}

export function markCurrentViewed(state) {
  const current = state.cards[state.currentIndex];
  if (!current || current.status !== 'unseen') return { ...state, isFlipped: true };
  return {
    ...setThemeCardStatus(state, current.id, 'viewed'),
    isFlipped: true,
  };
}

export function leaveCurrentCard(state) {
  const current = state.cards[state.currentIndex];
  if (!current || !['unseen', 'viewed'].includes(current.status)) return state;
  return setThemeCardStatus(state, current.id, 'skipped');
}

export function moveToThemeCard(state, index, { markUnansweredSkipped = true } = {}) {
  if (!Number.isInteger(index) || index < 0 || index >= state.cards.length) return state;
  const nextState = markUnansweredSkipped ? leaveCurrentCard(state) : state;
  return {
    ...nextState,
    currentIndex: index,
    isFlipped: false,
    showingSummary: false,
  };
}

export function summarizeThemeDecisions(state) {
  const summary = { selected: [], ignored: [], skipped: [], viewed: [], unseen: [] };
  state.cards.forEach((card) => summary[card.status].push(card));
  return summary;
}

export function completedThemeCount(state) {
  return state.cards.filter((card) => ['selected', 'ignored', 'skipped'].includes(card.status)).length;
}

export function isThemeJourneyComplete(state) {
  return completedThemeCount(state) === state.cards.length;
}

export function restartThemeJourney(state) {
  return createThemeDecisionState(state.cards);
}
