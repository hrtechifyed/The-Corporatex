import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const runtime = await readFile('src/employment-context.js', 'utf8');
const styles = await readFile('src/employment-context.css', 'utf8');
const build = await readFile('scripts/build.mjs', 'utf8');
const submitStory = await readFile('supabase/functions/submit-story/index.ts', 'utf8');
const migration = await readFile('supabase/migrations/202608150001_role_and_departure_context.sql', 'utf8');

test('Set the Scene replaces Team with a required role field and reference inputs', () => {
  assert.match(runtime, /Role <b aria-hidden="true">Required<\/b>/);
  assert.match(runtime, /e\.g\. Product Engineer/);
  assert.match(runtime, /Example: VMware \/ Broadcom/);
  assert.match(runtime, /Example: Chennai, Tamil Nadu, India/);
  assert.match(runtime, /ROLE_TITLES\.filter\(\(title\) => normalize\(title\)\.startsWith\(query\)\)/);
  assert.match(runtime, /No common title matches yet\. You can still enter your exact role/);
});

test('role autocomplete narrows by strict prefix and keeps common titles prominent', () => {
  for (const title of ['Software Engineer', 'Product Manager', 'Product Engineer', 'Project Manager', 'Solutions Architect']) {
    assert.match(runtime, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.doesNotMatch(runtime, /includes\(query\)/);
  assert.match(runtime, /slice\(0, 12\)/);
});

test('leaving month accepts MMYY input, formats MM\/YY and rejects future months', () => {
  assert.match(runtime, /placeholder="MM\/YY"/);
  assert.match(runtime, /Example: 06\/24 = June 2024/);
  assert.match(runtime, /replace\(\/\\D\/g, ''\)\.slice\(0, 4\)/);
  assert.match(runtime, /date > currentMonth/);
  assert.match(runtime, /departureMonth = result\.left\.iso/);
});

test('review and submission context retain role and leaving month', () => {
  assert.match(runtime, /roleDt\.textContent = 'Role'/);
  assert.match(runtime, /<dt>Left<\/dt>/);
  assert.match(runtime, /event\.detail\.context\.role = result\.role/);
  assert.match(runtime, /event\.detail\.context\.departureMonth = result\.left\.iso/);
  assert.match(submitStory, /role_title: role \|\| null/);
  assert.match(submitStory, /departure_month: departureMonth/);
  assert.match(submitStory, /broad_function: role \|\| team \|\| null/);
});

test('database migration and production build include employment context safely', () => {
  assert.match(migration, /add column if not exists role_title text/);
  assert.match(migration, /add column if not exists departure_month date/);
  assert.match(migration, /experiences_departure_month_first_day/);
  assert.match(build, /src\/employment-context\.css/);
  assert.match(build, /submit \? 'src\/employment-context\.js'/);
  assert.ok(build.indexOf("submit ? 'src/location-autocomplete.js'") < build.indexOf("submit ? 'src/employment-context.js'"));
  assert.ok(build.indexOf("submit ? 'src/employment-context.js'") < build.indexOf("submit ? 'src/github-submit.js'"));
});

test('employment context styling stays isolated from cards and navigation', () => {
  assert.match(styles, /\.ref-guided-context-grid/);
  assert.match(styles, /\.cx-role-listbox/);
  assert.match(styles, /@media\(max-width:760px\)/);
  for (const unrelated of ['pages-story-card', 'cx-home-published', 'cx-unified-header', 'pages-nav', 'story-row']) {
    assert.doesNotMatch(styles, new RegExp(unrelated));
  }
});
