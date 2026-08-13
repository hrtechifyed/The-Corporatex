import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');
const [login, account, authCss, navRuntime, confirmation, magicLink, build, productionRuntime] = await Promise.all([
  read('login.html'),
  read('account.html'),
  read('src/auth-experience.css'),
  read('src/contributor-nav.js'),
  read('supabase/templates/confirmation.html'),
  read('supabase/templates/magic-link.html'),
  read('scripts/build.mjs'),
  read('src/github-production.js'),
]);

assert.match(login, /Reading published stories stays open to everyone/i);
assert.match(login, /Email my access link/);
assert.match(login, /shouldCreateUser:\s*true/);
assert.match(login, /product:\s*'CorporateX'/);
assert.match(login, /Open My Space/);
assert.match(login, /class="cx-auth-visual"/);
assert.equal((login.match(/<article>/g) || []).length, 3, 'My Space access must keep three concise purpose cards');
assert.doesNotMatch(login, /secure Supabase magic link/i, 'implementation-provider language must not lead the user experience');

assert.match(account, /Keep what matters\.\s*<br \/><em>Follow what changes\.<\/em>/);
assert.match(account, /data-space-tab="saved"/);
assert.match(account, /data-space-tab="following"/);
assert.match(account, /data-space-tab="submissions"/);
assert.match(account, /saved_experiences/);
assert.match(account, /experience_follows/);
assert.match(account, /class="cx-auth-visual"/);
assert.doesNotMatch(account, /Your stories,<br \/><em>your status\.<\/em>/i, 'oversized legacy private archive title must not return');

assert.match(authCss, /\.cx-auth-shell/);
assert.match(authCss, /grid-template-columns:minmax\(0,\.96fr\) minmax\(380px,\.84fr\)/);
assert.match(authCss, /@media\(max-width:820px\)/);
assert.match(authCss, /\.cx-auth-visual/);
assert.match(authCss, /\.cx-space-tabs/);
assert.match(authCss, /\.cx-story-action/);

assert.match(navRuntime, /My Space/);
assert.doesNotMatch(navRuntime, /label\.textContent = 'My Stories'/);
assert.match(build, /src\/contributor-nav\.js/);
assert.match(productionRuntime, /saved_experiences/);
assert.match(productionRuntime, /experience_follows/);
assert.match(productionRuntime, /story_questions/);
assert.match(productionRuntime, /Ask a useful follow-up/);

for (const [name, template] of [['confirmation', confirmation], ['magic link', magicLink]]) {
  assert.match(template, /HRTechify · CorporateX/, `${name}: HRTechify/CorporateX brand missing`);
  assert.match(template, /\{\{ \.ConfirmationURL \}\}/, `${name}: secure confirmation URL variable missing`);
  assert.match(template, /\{\{ \.Email \}\}/, `${name}: recipient email variable missing`);
  assert.match(template, /never displayed with a published story|never displayed with a published workplace story/i, `${name}: privacy explanation missing`);
  assert.doesNotMatch(template, /powered by Supabase|Supabase Auth/i, `${name}: provider branding must not appear in user-facing email copy`);
}

console.log('My Space auth experience checks passed: saved/following/submissions, anime UI and HRTechify email branding are stable.');
