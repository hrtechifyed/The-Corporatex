import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const picker = await readFile('src/location-autocomplete.js', 'utf8');
const submitUi = await readFile('src/github-submit.js', 'utf8');
const searchFn = await readFile('supabase/functions/search-locations/index.ts', 'utf8');
const submitFn = await readFile('supabase/functions/submit-story/index.ts', 'utf8');
const migration = await readFile('supabase/migrations/202608140006_global_location_special_options.sql', 'utf8');

test('location picker searches the global catalogue instead of loading every city into the browser', () => {
  assert.match(picker, /functions\/v1\/search-locations/);
  assert.match(picker, /Type any city, or choose Remote \/ Other/);
  assert.match(picker, /setTimeout\(\(\) => search\(query\), 150\)/);
  assert.doesNotMatch(picker, /from\('story_locations'\)\.select\([\s\S]*order\('priority'[\s\S]*locations\s*=/);
});

test('Remote and Other are explicit location choices', () => {
  assert.match(searchFn, /display_name: "Remote", category: "remote"/);
  assert.match(searchFn, /display_name: "Other", category: "other"/);
  assert.match(migration, /\('Remote','remote',1,true\)/);
  assert.match(migration, /\('Other','other',2,true\)/);
  assert.match(migration, /category in \('city','remote','other'\)/);
});

test('global city search is strict prefix search with prominence ranking', () => {
  assert.match(searchFn, /country-state-city@3\.2\.1/);
  assert.match(searchFn, /City\.getAllCities\(\)/);
  assert.match(searchFn, /const MAX_RESULTS = 15/);
  assert.match(searchFn, /PROMINENT_CITY_SCORES/);
  assert.match(searchFn, /\["chennai\|IN", 1000\]/);
  assert.match(searchFn, /\["coimbatore\|IN", 945\]/);
  assert.match(searchFn, /\["cincinnati\|US", 940\]/);
  assert.match(searchFn, /firstLetterIndex/);
  assert.match(searchFn, /firstTwoIndex/);
  assert.match(searchFn, /city\.city_search\.startsWith\(query\)/);
  assert.doesNotMatch(searchFn, /search_name\.includes\(query\)/);
  assert.match(searchFn, /Origin not allowed/);
});

test('selected city metadata is carried into submit-story', () => {
  assert.match(submitUi, /locationSelection: selectedLocationMetadata\(\)/);
  assert.match(submitUi, /dataset\.locationCountryCode/);
  assert.match(submitUi, /dataset\.locationStateCode/);
});

test('submit-story independently validates a global city before registering it', () => {
  assert.match(submitFn, /validateGlobalLocation/);
  assert.match(submitFn, /City\.getCitiesOfState\(countryCode, stateCode\)/);
  assert.match(submitFn, /City\.getCitiesOfCountry\(countryCode\)/);
  assert.match(submitFn, /normalize\(city\.name\) === normalize\(cityName\)/);
  assert.match(submitFn, /from\("story_locations"\)\.upsert/);
  assert.match(submitFn, /Choose a valid city, Remote, or Other/);
});

test('legacy saved submissions can only fall back to an already approved active location', () => {
  assert.match(submitFn, /from\("story_locations"\)[\s\S]*\.eq\("display_name", location\)[\s\S]*\.eq\("is_active", true\)/);
});
