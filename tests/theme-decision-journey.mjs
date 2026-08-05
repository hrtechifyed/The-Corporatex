import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { THEME_DECISION_CARDS, THEME_DECISION_STATUSES } from '../src/theme-decision-data.js';
import {
  completedThemeCount,
  createThemeDecisionState,
  isThemeJourneyComplete,
  leaveCurrentCard,
  moveToThemeCard,
  restartThemeJourney,
  setThemeCardStatus,
  summarizeThemeDecisions,
} from '../src/theme-decision-state.js';

assert.equal(THEME_DECISION_CARDS.length, 10, 'the journey must contain exactly ten cards');
assert.deepEqual(THEME_DECISION_STATUSES, ['unseen', 'viewed', 'selected', 'ignored', 'skipped']);

const requiredFields = ['id', 'number', 'theme', 'teaser', 'context', 'example', 'icon', 'scene', 'status', 'nextCardName'];
THEME_DECISION_CARDS.forEach((card, index) => {
  requiredFields.forEach((field) => assert.ok(card[field] !== undefined && card[field] !== '', `card ${index + 1} requires ${field}`));
  assert.equal(card.number, index + 1, 'card numbering must be sequential');
  assert.equal(card.status, 'unseen', 'all cards must begin unseen');
});

let state = createThemeDecisionState(THEME_DECISION_CARDS);
assert.equal(state.currentIndex, 0);
assert.equal(completedThemeCount(state), 0);
assert.equal(isThemeJourneyComplete(state), false);

state = setThemeCardStatus(state, 'opening-scene', 'selected');
state = moveToThemeCard(state, 1, { markUnansweredSkipped: false });
state = setThemeCardStatus(state, 'role-rewrite', 'ignored');
state = moveToThemeCard(state, 2, { markUnansweredSkipped: false });
state = leaveCurrentCard(state);

let summary = summarizeThemeDecisions(state);
assert.equal(summary.selected.length, 1, 'selected choices must be summarised');
assert.equal(summary.ignored.length, 1, 'ignored choices must be summarised');
assert.equal(summary.skipped.length, 1, 'unanswered cards must remain reviewable as skipped');

state = setThemeCardStatus(state, 'opening-scene', 'ignored');
summary = summarizeThemeDecisions(state);
assert.equal(summary.selected.length, 0, 'users must be able to revise Select to Ignore');
assert.equal(summary.ignored.length, 2, 'revised choices must update counts');

state = setThemeCardStatus(state, 'role-rewrite', 'selected');
summary = summarizeThemeDecisions(state);
assert.equal(summary.selected.length, 1, 'users must be able to revise Ignore to Select');

for (const card of state.cards) {
  if (['unseen', 'viewed'].includes(card.status)) state = setThemeCardStatus(state, card.id, 'skipped');
}
assert.equal(completedThemeCount(state), 10);
assert.equal(isThemeJourneyComplete(state), true);

state = restartThemeJourney(state);
assert.equal(completedThemeCount(state), 0, 'restart must clear all decisions');
assert.ok(state.cards.every((card) => card.status === 'unseen'));

const journeySource = await readFile('src/theme-decision-journey.js', 'utf8');
const stateSource = await readFile('src/theme-decision-state.js', 'utf8');
const dataSource = await readFile('src/theme-decision-data.js', 'utf8');
const css = await readFile('src/theme-decision-journey.css', 'utf8');

for (const [name, source] of Object.entries({ journeySource, stateSource, dataSource })) {
  assert.doesNotMatch(source, /localStorage|sessionStorage/, `${name} must keep choices in memory only`);
}

assert.match(journeySource, /pageName === 'freeflow-story\.html'/, 'the replacement must target only the Free-flow optional-theme section');
assert.doesNotMatch(journeySource, /\['guided-story\.html', 'freeflow-story\.html'\]/, 'Guided Story must retain its separate turning-point flow');
assert.match(journeySource, /aria-live="polite"/, 'selection confirmations require an aria-live region');
assert.match(journeySource, /aria-pressed/, 'Select and Ignore actions require pressed state');
assert.match(journeySource, /aria-hidden="\$\{state\.isFlipped\}"/, 'the hidden front face must be removed from accessibility navigation');
assert.match(journeySource, /state\.isFlipped \? '' : 'inert'/, 'the hidden back face must be inert');
assert.match(journeySource, /theme-next-preview/, 'the next card name must stay visible outside the flipped face');
assert.match(journeySource, /ArrowLeft/, 'Left Arrow navigation is required');
assert.match(journeySource, /ArrowRight/, 'Right Arrow navigation is required');
assert.match(journeySource, /Escape/, 'Escape must return the card to its front side');
assert.match(journeySource, /data-review-skipped/, 'skipped cards must be reviewable');
assert.match(journeySource, /data-confirm-themes/, 'selected themes must have a confirmation action');
assert.match(journeySource, /data-restart-journey/, 'the journey must support restart');
assert.match(journeySource, /emitState\('themejourneyconfirmed'\)/, 'confirmation must expose selected themes for future form or database integration');
assert.match(journeySource, /themejourneychange/, 'every choice change must be exposed in application state');

assert.match(css, /perspective:1600px/, 'the card stage requires CSS perspective');
assert.match(css, /rotateY\(180deg\)/, 'the card must flip around the vertical axis');
assert.match(css, /backface-visibility:hidden/, 'card faces must not appear together or mirrored');
assert.match(css, /min-height:44px/, 'touch targets must be at least 44px high');
assert.match(css, /@media\(max-width:760px\)/, 'mobile layout rules are required');
assert.match(css, /@media\(prefers-reduced-motion:reduce\)/, 'reduced-motion behaviour is required');
assert.match(css, /\.theme-card-preview\{display:none\}/, 'mobile must remove side previews without horizontal scrolling');

console.log('Theme decision journey checks passed.');
