import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const journey = await readFile('src/exit-journey-signal.css', 'utf8');
const guided = await readFile('src/guided-mobile-polish.css', 'utf8');
const build = await readFile('scripts/build.mjs', 'utf8');

test('journey milestones cannot run ahead of the traveller', () => {
  assert.match(journey, /--cx-exit-duration:\s*8\.8s/);
  assert.match(journey, /animation-delay:\s*0s !important/);
  assert.match(journey, /animation-timing-function:\s*steps\(1, end\)/);
  assert.match(journey, /59%, 66\.99%/);
  assert.match(journey, /83%, 90\.99%/);
  assert.match(journey, /animation:\s*cx-exit-traveller var\(--cx-exit-duration\)/);
});

test('guided mobile stepper is an intentional two by two layout', () => {
  assert.match(guided, /@media \(max-width: 760px\)/);
  assert.match(guided, /\.ref-guided-steps[\s\S]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(guided, /\.ref-guided-steps li:nth-child\(n\+3\)[\s\S]*border-top/);
  assert.match(guided, /\.ref-guided-steps li:nth-child\(even\)[\s\S]*border-left/);
});

test('ending choices are compact enough to expose multiple options on a phone', () => {
  assert.match(guided, /\.cx-ending-grid[\s\S]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(guided, /\.cx-ending-image[\s\S]*height:\s*142px/);
  assert.match(guided, /\.cx-ending-panel[\s\S]*padding:\s*18px 12px 14px/);
});

test('guided mobile polish is loaded after the base guided production stylesheet', () => {
  assert.match(build, /src\/guided-mobile-polish\.css/);
  assert.ok(build.indexOf('src/guided-mobile-polish.css') > build.indexOf('src/guided-production.css'));
});
