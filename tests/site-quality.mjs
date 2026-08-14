import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');
const pages = {
  home: await read('index.html'),
  guided: await read('guided-story.html'),
  stories: await read('stories.html'),
  detail: await read('story-detail.html'),
  more: await read('more-info.html'),
  privacy: await read('privacy-safety.html'),
};
const shareRedirect = await read('share-story.html');
const referenceCss = await read('src/reference-exact.css');
const functionalCss = await read('src/reference-functional.css');
const cinematicCss = await read('src/cinematic-card-system.css');
const guidedCss = await read('src/guided-only-aerial.css');
const experienceCss = await read('src/cinematic-story-experience.css');
const referenceJs = await read('src/reference-exact.js');
const workflowModel = await read('src/story-workflow-model.js');
const storyScenes = await read('public/story-scenes.svg');
const readme = await read('README.md');
const packageJson = JSON.parse(await read('package.json'));

const navHrefs = ['index.html', 'guided-story.html', 'stories.html', 'more-info.html', 'privacy-safety.html'];
const footerPrimary = 'CorporateX - Powered by - HRTechify - People • Technology • Growth';
const footerSecondary = '© 2026 All Rights Reserved.';
const decodeStaticEntities = (html) => html
  .replaceAll('&bull;', '•')
  .replaceAll('&copy;', '©')
  .replaceAll('&amp;', '&');
const visibleText = (html) => decodeStaticEntities(html)
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const classToken = (token) => new RegExp(`class="[^"]*\\b${token}\\b[^"]*"`);

for (const [name, html] of Object.entries(pages)) {
  const nav = html.match(/<nav class="ref-primary-nav"[\s\S]*?<\/nav>/)?.[0] || '';
  const positions = navHrefs.map((href) => nav.indexOf(`href="${href}"`));
  const decoded = decodeStaticEntities(html);
  assert.ok(positions.every((position) => position >= 0), `${name}: shared navigation links must exist`);
  assert.ok(positions.every((position, index) => index === 0 || position > positions[index - 1]), `${name}: navigation order changed`);
  assert.match(html, /<strong>CorporateX<\/strong>/, `${name}: CorporateX product name missing from navigation`);
  assert.doesNotMatch(html, /The Corporate Ex/i, `${name}: retired product name must not be visible`);
  assert.doesNotMatch(html, /data-ref-signin|>Sign In</i, `${name}: non-functional Sign In must not be shown`);
  assert.match(html, /src\/reference-exact\.css/, `${name}: shared reference stylesheet missing`);
  assert.match(html, /src\/reference-functional\.css/, `${name}: functional stylesheet missing`);
  assert.match(html, /src\/cinematic-card-system\.css/, `${name}: cinematic card stylesheet missing`);
  assert.match(html, /src\/reference-exact\.js/, `${name}: shared runtime missing`);
  assert.equal((decoded.match(new RegExp(footerPrimary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length, 1, `${name}: exact CorporateX footer must appear once`);
  assert.equal((decoded.match(new RegExp(footerSecondary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length, 1, `${name}: exact copyright footer must appear once`);
  assert.match(html, /class="site-footer"/, `${name}: shared footer class missing`);
}

for (const name of ['home', 'guided']) {
  assert.doesNotMatch(pages[name], /src\/app-v2\.(?:css|js)/, `${name}: legacy app assets must not alter the focused page`);
}

assert.match(shareRedirect, /http-equiv="refresh" content="0; url=guided-story\.html"/);
assert.match(shareRedirect, /location\.replace\('guided-story\.html'\)/);
assert.doesNotMatch(shareRedirect, /ref-choice-card|Start Guided Story/, 'compatibility page must not restore an intermediate decision screen');
await assert.rejects(access('freeflow-story.html'), 'the retired Free-flow page must not be shipped');
assert.doesNotMatch(Object.values(pages).join('\n'), /share-story\.html|freeflow-story\.html|FREE-FLOW STORY|Free-flow Story|Switch to Free-flow/i, 'public navigation must go directly to Guided Story');

assert.match(pages.home, /Before you join,<br \/>hear why people left\./);
assert.match(pages.home, /Structured exit stories for better employer decisions/);
assert.match(pages.home, /examples are fictional/);
assert.match(pages.home, /Safety screened/);
assert.equal((pages.home.match(/class="ref-home-signal-card/g) || []).length, 5, 'home must use five cinematic signal cards');
assert.equal((pages.home.match(/class="ref-theme-signal-list"[\s\S]*?<\/div>/)?.[0].match(/<a /g) || []).length, 7, 'home theme strip must remain intentionally compact');
assert.equal((pages.home.match(/<article>/g) || []).length, 4, 'home must keep exactly four trust statements');
assert.doesNotMatch(pages.home, /class="ref-word-cloud"/, 'the dense word cloud must not return');

assert.match(pages.guided, /data-guided-workflow/);
assert.match(pages.guided, /data-guided-step="context"/);
assert.match(pages.guided, /src\/cinematic-story-experience\.css/);
assert.equal((pages.guided.match(/data-guided-step-marker=/g) || []).length, 3, 'guided flow must show Set the Scene, Story Beats and The Final Cut');
assert.match(visibleText(pages.guided), /Set the Scene/);
assert.match(visibleText(pages.guided), /Story Beats/);
assert.match(visibleText(pages.guided), /The Final Cut/);
assert.doesNotMatch(visibleText(pages.guided), /\bchapter\b/i, 'public Guided copy must use Story Beat rather than chapter');
assert.match(pages.guided, /class="ref-context-visual"/);
assert.match(pages.guided, /story-scenes\.svg#personal/);
assert.match(pages.guided, classToken('ref-context-company'));
assert.match(pages.guided, classToken('ref-context-location'));
assert.match(pages.guided, classToken('ref-context-team'));
assert.match(pages.guided, /data-guided-context-next/);
assert.match(pages.guided, /data-guided-edit-context/);
assert.match(pages.guided, /data-guided-editor-context/);
assert.match(pages.guided, /data-guided-review-context-edit/);
assert.match(pages.guided, /data-guided-review-story-edit/);
assert.match(pages.guided, /data-guided-dots/);
assert.equal((pages.guided.match(/<button[^>]+class="ref-journey-card/g) || []).length, 8, 'all Story Beats must be semantic buttons');
assert.equal((pages.guided.match(/data-guided-chapter=/g) || []).length, 8, 'guided journey must keep eight reusable Story Beat IDs');
assert.equal((pages.guided.match(/class="ref-card-icon"/g) || []).length, 0, 'Story Beat cards must not use numbered emblems');
assert.equal((pages.guided.match(/class="ref-card-status"/g) || []).length, 0, 'Story Beat cards must not use sequence/status captions');
assert.doesNotMatch(pages.guided, /ref-journey-card (?:orange|purple)/, 'Story Beat cards must not use per-card color variants');
assert.match(pages.guided, /The AI Turn/);
assert.doesNotMatch(visibleText(pages.guided), /The AI Chapter/);
assert.match(pages.guided, /data-guided-company[^>]+required/);
assert.match(pages.guided, /data-guided-team/);
assert.match(pages.guided, /data-guided-location[^>]+required/);
assert.match(pages.guided, /list="guided-location-suggestions"/);
assert.match(pages.guided, /data-guided-review-context="company"/);
assert.match(pages.guided, /data-guided-review-context="team"/);
assert.match(pages.guided, /data-guided-review-context="location"/);
assert.match(pages.guided, /data-guided-editor[^>]+hidden/);
assert.match(pages.guided, /data-guided-review-panel hidden/);
assert.equal((pages.guided.match(/type="checkbox"/g) || []).length, 1, 'guided review must use one final agreement checkbox');
assert.equal((pages.guided.match(/public\/story-scenes\.svg#/g) || []).length, 9, 'context plus all eight Story Beats must use stable SVG scenes');
assert.match(pages.guided, /direct racial slurs/);
assert.match(pages.guided, /does not judge your opinion/);
assert.match(pages.guided, /nothing is uploaded or published/i);

assert.match(pages.stories, /Northstar Technologies/);
assert.match(pages.stories, /Atlas Systems/);
assert.match(pages.stories, /Meridian Works/);
assert.match(pages.stories, /every account shown below is fictional demonstration content/);
assert.doesNotMatch(pages.stories, /Sony|NVIDIA/, 'fictional demonstration stories must not use real employer names');
assert.equal((pages.stories.match(/class="story-row card-interactive"/g) || []).length, 10, 'stories directory must render ten reusable story cards');
assert.equal((pages.stories.match(/class="story-thumb"/g) || []).length, 10, 'every story card must include a relevant visual');
assert.match(pages.detail, /class="story-hero-visual"/);
assert.match(pages.detail, /not an employee submission/i);
assert.match(pages.detail, /Opinions are not moderated/);
assert.equal((pages.detail.match(/class="story-section/g) || []).length, 5, 'story detail must preserve five readable narrative moments');

assert.match(pages.more, /src\/cinematic-story-experience\.css/);
assert.match(pages.more, /class="page-shell more-cinematic-hero"/);
assert.match(pages.more, /class="more-hero-visual"/);
assert.equal((pages.more.match(/class="more-visual-card/g) || []).length, 3, 'More must use three image-led distinction cards');
assert.equal((pages.more.match(/class="more-card-art"/g) || []).length, 3, 'every distinction card needs an illustration');
assert.match(pages.more, /class="page-shell more-feature-split"/);
assert.match(pages.more, /class="page-shell more-trust-panel"/);
assert.equal((pages.more.match(/<article>/g) || []).length, 3, 'More must keep three compact trust cards');
assert.doesNotMatch(pages.more, /<details class="info-card/, 'More must not return to a text-first accordion stack');
assert.match(pages.more, /Safety screening only/);
assert.equal((pages.privacy.match(/<details class="policy-card/g) || []).length, 6, 'Privacy page must use six expandable cards');
assert.match(pages.privacy, /SAFETY SCREEN ONLY/);
assert.match(pages.privacy, /does not defend employers from criticism/);
assert.doesNotMatch(Object.values(pages).join('\n'), /Human moderated|HUMAN REVIEW|human moderation/i, 'broad human moderation claims must not return');

for (const symbol of ['growth', 'leadership', 'wellbeing', 'change', 'compensation', 'personal', 'ai']) {
  assert.ok(storyScenes.includes(`id="${symbol}"`), `story scene sprite is missing ${symbol}`);
}

assert.match(referenceCss, /\.ref-nav\{/);
assert.match(referenceCss, /@media\(max-width:760px\)/);
assert.match(functionalCss, /\.ref-story-editor/);
assert.match(functionalCss, /\.site-footer/);
assert.match(cinematicCss, /\.ref-home-card-stage/);
assert.match(cinematicCss, /\.story-thumb/);
assert.doesNotMatch(guidedCss, /@keyframes|offset-path:\s*path|guided-calm-float/i, 'Story Beat cards must not loop or travel continuously');
assert.match(guidedCss, /\.ref-journey-card\.is-prev/);
assert.match(guidedCss, /\.ref-journey-card\.is-active/);
assert.match(guidedCss, /\.ref-journey-card\.is-next/);
assert.match(guidedCss, /contain:\s*layout paint/);
assert.match(guidedCss, /overflow:\s*hidden/);
assert.match(guidedCss, /\.ref-chapter-dot/);
assert.match(guidedCss, /@media \(prefers-reduced-motion:reduce\)/);
assert.match(experienceCss, /\.ref-context-cinematic/);
assert.match(experienceCss, /grid-template-areas:\s*\n\s*"company location"\s*\n\s*"team team"/);
assert.match(experienceCss, /\.ref-context-visual/);
assert.match(experienceCss, /\.more-cinematic-hero/);
assert.match(experienceCss, /\.more-visual-grid/);
assert.match(experienceCss, /\.more-feature-split/);
assert.match(experienceCss, /@media\(prefers-reduced-motion:reduce\)/);
assert.doesNotMatch(experienceCss, /infinite/, 'cinematic page motion must not loop continuously');

assert.match(referenceJs, /story-workflow-model\.js/);
assert.match(referenceJs, /guidedstoryconfirmed/);
assert.match(referenceJs, /validateGuidedContext/);
assert.match(referenceJs, /buildGuidedSubmission/);
assert.match(referenceJs, /function setStep/);
assert.match(referenceJs, /function createStoryBeatDots/);
assert.match(referenceJs, /function activateStoryBeat/);
assert.match(referenceJs, /card\.hidden = !visible/);
assert.match(referenceJs, /is-prev/);
assert.match(referenceJs, /is-next/);
assert.match(referenceJs, /data-guided-context-next/);
assert.match(referenceJs, /data-guided-editor-context/);
assert.match(referenceJs, /data-guided-review-context-edit/);
assert.match(referenceJs, /data-guided-review-story-edit/);
assert.match(referenceJs, /data-edit-beat/);
assert.match(referenceJs, /Open Story Beat/);
assert.match(referenceJs, /ArrowLeft/);
assert.match(referenceJs, /ArrowRight/);
assert.match(referenceJs, /aria-invalid/);
assert.doesNotMatch(referenceJs, /data-ref-signin|Sign in will be added later/i, 'non-functional account UI must be removed');
assert.doesNotMatch(referenceJs, /freeflow|FREEFLOW|free-flow/i, 'retired Free-flow runtime must be removed');
assert.doesNotMatch(referenceJs, /localStorage|sessionStorage/, 'guided story state must remain in memory only');
assert.doesNotMatch(workflowModel, /freeflow|FREEFLOW|free-flow/i, 'workflow model must be Guided-only');
assert.doesNotMatch(workflowModel, /localStorage|sessionStorage/, 'workflow model must remain persistence-neutral');
assert.match(workflowModel, /title: 'The AI Turn'/);
assert.doesNotMatch(workflowModel, /The AI Chapter/);
assert.equal((workflowModel.match(/id: '/g) || []).length, 8, 'workflow model must define exactly eight Story Beats');

assert.equal(packageJson.name, 'corporatex');
assert.match(readme, /^#?\s*CorporateX|<h1 align="center">CorporateX<\/h1>/m);
assert.doesNotMatch(readme, /The Corporate Ex/);
assert.match(readme, /does \*\*not\*\* moderate whether a contributor's opinion/);

console.log('Site quality checks passed: cinematic context, Story Beats, reversible navigation and visual More page.');
