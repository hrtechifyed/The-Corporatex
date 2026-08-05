import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GUIDED_CHAPTERS,
  adjacentChapterId,
  buildGuidedReview,
  buildGuidedSubmission,
  chapterStatus,
  createGuidedState,
  guidedProgress,
  markGuidedSkipped,
  setActiveChapter,
  setGuidedContext,
  setGuidedResponse,
  validateGuidedContext,
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

test('company and location are required while team remains optional', () => {
  const empty = validateGuidedContext({ company: '', team: '', location: '' });
  assert.equal(empty.valid, false);
  assert.ok(empty.errors.company);
  assert.ok(empty.errors.location);
  assert.equal(empty.errors.team, undefined);

  const valid = validateGuidedContext({
    company: 'Northstar Technologies',
    team: '',
    location: 'Remote — Europe',
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
  assert.deepEqual(valid.context, {
    company: 'Northstar Technologies',
    team: '',
    location: 'Remote — Europe',
  });
});

test('guided submission combines required context, chapters and progress', () => {
  let state = createGuidedState();
  state = setGuidedContext(state, 'company', 'Northstar Technologies');
  state = setGuidedContext(state, 'team', 'Product');
  state = setGuidedContext(state, 'location', 'Bengaluru, India');
  state = setGuidedResponse(state, 'beginning', 'I joined for meaningful ownership and a clear learning path.');

  const submission = buildGuidedSubmission(state);
  assert.equal(submission.valid, true);
  assert.equal(submission.context.company, 'Northstar Technologies');
  assert.equal(submission.context.team, 'Product');
  assert.equal(submission.context.location, 'Bengaluru, India');
  assert.equal(submission.chapters.length, 8);
  assert.equal(submission.progress.answered, 1);
});
