import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const published = await readJson('data/published-stories.json');
const status = await readJson('data/beta-status.json');
const template = await readJson('data/story-template.json');
const schema = await readJson('data/story.schema.json');
const buildSource = await readFile('scripts/build.mjs', 'utf8');
const betaSource = await readFile('src/beta-content.js', 'utf8');

assert.equal(published.version, 1, 'published story data version must be 1');
assert.ok(Array.isArray(published.stories), 'published stories must be an array');
assert.ok(['awaiting_genuine_contributors', 'intake_open', 'ready_for_controlled_beta'].includes(status.state), 'unknown beta status');
assert.ok(status.minimum_story_count >= 10, 'controlled beta minimum should be at least 10 stories');
assert.ok(status.target_story_count >= status.minimum_story_count, 'target story count must meet the minimum');
assert.equal(status.verification_deferred, true, 'employee verification remains a later phase');
assert.match(buildSource, /cp\('data', 'dist\/data'/, 'the static build must include beta data');
assert.match(betaSource, /textContent/, 'story rendering must use safe text assignment');
assert.doesNotMatch(betaSource, /innerHTML\s*=.*story\./s, 'story data must not be injected through innerHTML');

const required = schema.required;
const permittedLabels = new Set(['Anonymous contributor', 'Contributor approved', 'Human moderated']);
const forbiddenKeys = new Set(['email', 'name', 'manager_name', 'phone', 'linkedin', 'exact_team']);

function validateStory(story, index) {
  for (const key of required) assert.ok(key in story, `story ${index}: missing ${key}`);
  for (const key of Object.keys(story)) assert.ok(!forbiddenKeys.has(key), `story ${index}: private field ${key} is not publishable`);
  assert.match(story.id, /^story_[a-z0-9_-]+$/, `story ${index}: invalid id`);
  assert.match(story.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `story ${index}: invalid slug`);
  assert.match(story.anonymous_id, /^HRT-[A-Z0-9]{7,12}$/, `story ${index}: invalid anonymous id`);
  assert.ok(story.labels.every((label) => permittedLabels.has(label)), `story ${index}: unsupported public label`);
  for (const section of ['beginning', 'good_part', 'shift', 'tipping_point', 'candidate_question']) {
    assert.ok(typeof story.sections?.[section] === 'string' && story.sections[section].trim().length >= 10, `story ${index}: incomplete ${section}`);
  }
}

published.stories.forEach(validateStory);
if (status.state === 'ready_for_controlled_beta') {
  const employers = new Set(published.stories.map((story) => story.employer));
  const themes = new Set(published.stories.map((story) => story.primary_theme));
  assert.ok(published.stories.length >= status.minimum_story_count, 'ready status requires the minimum story count');
  assert.ok(employers.size >= status.minimum_employer_count, 'ready status requires the minimum employer count');
  assert.ok(themes.size >= status.minimum_theme_count, 'ready status requires the minimum theme count');
}
assert.ok(required.every((key) => key in template), 'story template must include every required field');
console.log(`Controlled beta readiness checks passed. Current genuine story count: ${published.stories.length}. State: ${status.state}.`);
