import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');
const [login, account, authCss, navRuntime, confirmation, magicLink, build] = await Promise.all([
  read('login.html'),
  read('account.html'),
  read('src/auth-experience.css'),
  read('src/contributor-nav.js'),
  read('supabase/templates/confirmation.html'),
  read('supabase/templates/magic-link.html'),
  read('scripts/build.mjs'),
]);

assert.match(login, /Reading published stories is always open and never requires an account/i);
assert.match(login, /Email my access link/);
assert.match(login, /shouldCreateUser:\s*true/);
assert.match(login, /data:\s*\{\s*product:\s*'CorporateX'/);
assert.match(login, /class="cx-auth-visual"/);
assert.equal((login.match(/<article>/g) || []).length, 3, 'contributor access must keep three concise purpose cards');
assert.doesNotMatch(login, /secure Supabase magic link/i, 'implementation-provider language must not lead the contributor experience');

assert.match(account, /Your story\.\s*<br \/><em>Your timeline\.<\/em>/);
assert.match(account, /Only you see this archive/);
assert.match(account, /Browsing never needs sign-in/);
assert.match(account, /class="cx-account-list"/);
assert.match(account, /class="cx-auth-visual"/);
assert.doesNotMatch(account, /Your stories,<br \/><em>your status\.<\/em>/i, 'oversized legacy private archive title must not return');

assert.match(authCss, /\.cx-auth-shell/);
assert.match(authCss, /grid-template-columns:\s*minmax\(0, \.96fr\) minmax\(380px, \.84fr\)/);
assert.match(authCss, /@media \(max-width: 820px\)/);
assert.match(authCss, /\.cx-auth-visual/);
assert.match(authCss, /\.cx-account-state/);

assert.match(navRuntime, /My Stories/);
assert.doesNotMatch(navRuntime, /textContent\s*=\s*'Sign In'/);
assert.match(build, /src\/contributor-nav\.js/);

for (const [name, template] of [['confirmation', confirmation], ['magic link', magicLink]]) {
  assert.match(template, /HRTechify · CorporateX/, `${name}: HRTechify/CorporateX brand missing`);
  assert.match(template, /\{\{ \.ConfirmationURL \}\}/, `${name}: secure confirmation URL variable missing`);
  assert.match(template, /\{\{ \.Email \}\}/, `${name}: recipient email variable missing`);
  assert.match(template, /never displayed with a published story|never displayed with a published workplace story/i, `${name}: privacy explanation missing`);
  assert.doesNotMatch(template, /powered by Supabase|Supabase Auth/i, `${name}: provider branding must not appear in user-facing email copy`);
}

console.log('Contributor auth experience checks passed: purpose clarity, anime UI and HRTechify email branding are stable.');
