import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GUIDED_CHAPTERS,
  FREEFLOW_MIN_LENGTH,
  adjacentChapterId,
  buildGuidedReview,
  chapterStatus,
  createGuidedState,
  guidedProgress,
  markGuidedSkipped,
  setActiveChapter,
  setGuidedResponse,
  validateFreeflowDraft,
} from '../src/story-workflow-model.js';

test('guided journey exposes eight unique, complete chapters', () => {
  assert.equal(GUIDED_CHAPTERS.length, 8);
  assert.equal(new Set(GUIDED_CHAPTERS.map((chapter) => chapter.id)).size, 8);
  for (const chapter of GUIDED_CHAPTERS) {
    assert.ok(chapter.title);
    assert.ok(chapter.teaser);
    assert.ok(chapter.prompt);
    assert.ok(chapter.helper);
    assert.ok(chapter.placeholder);
    assert.ok(chapter.scene);
  }
});

test('guided responses, skips and progress remain revisable', () => {
  let state = createGuidedState();
  state = setGuidedResponse(state, 'beginning', 'I joined for the learning opportunity.');
  state = markGuidedSkipped(state, 'promise');
  assert.equal(chapterStatus(state, 'beginning'), 'answered');
  assert.equal(chapterStatus(state, 'promise'), 'skipped');
  assert.deepEqual(guidedProgress(state), { answered: 1, skipped: 1, completed: 2, total: 8, percent: 25 });

  state = setGuidedResponse(state, 'promise', 'I expected a clear path to ownership.');
  assert.equal(chapterStatus(state, 'promise'), 'answered');
  assert.deepEqual(guidedProgress(state), { answered: 2, skipped: 0, completed: 2, total: 8, percent: 25 });
});

test('chapter navigation stops at the first and final cards', () => {
  assert.equal(adjacentChapterId('beginning', -1), 'beginning');
  assert.equal(adjacentChapterId('beginning', 1), 'promise');
  assert.equal(adjacentChapterId('fit', 1), 'fit');
  assert.equal(adjacentChapterId('ai', 1), 'fit');
});

test('review output keeps every chapter and its current status', () => {
  let state = createGuidedState();
  state = setActiveChapter(state, 'shift');
  state = setGuidedResponse(state, 'shift', 'The team changed after a reorganisation.');
  const review = buildGuidedReview(state);
  assert.equal(review.length, 8);
  assert.equal(review.find((chapter) => chapter.id === 'shift').status, 'answered');
  assert.equal(review.find((chapter) => chapter.id === 'shift').response, 'The team changed after a reorganisation.');
});

test('free-flow validation requires employer and useful story context', () => {
  const empty = validateFreeflowDraft({ employer: '', story: '' });
  assert.equal(empty.valid, false);
  assert.ok(empty.errors.employer);
  assert.ok(empty.errors.story);

  const tooShort = validateFreeflowDraft({ employer: 'Northstar Technologies', story: 'Too short.' });
  assert.equal(tooShort.valid, false);
  assert.match(tooShort.errors.story, new RegExp(String(FREEFLOW_MIN_LENGTH)));

  const valid = validateFreeflowDraft({
    employer: 'Northstar Technologies',
    story: 'I joined for a clear learning path, but the role changed after a reorganisation and the workload became difficult to sustain.',
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});
