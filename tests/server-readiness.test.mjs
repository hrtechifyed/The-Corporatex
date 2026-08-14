import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');
const packageJson = JSON.parse(await read('package.json'));
const renderBlueprint = await read('render.yaml');
const healthRoute = await read('app/api/health/route.ts');
const storyAnalysisModule = await read('lib/story-analysis.ts');
const analysisRunner = await read('components/analysis-runner.tsx');
const envExample = await read('.env.example');
const siteWorkflow = await read('.github/workflows/site-quality.yml');
const pagesWorkflow = await read('.github/workflows/deploy-pages.yml');
const rootLayout = await read('app/layout.tsx');
const submitPage = await read('app/submit/page.tsx');
const contributorJourney = await read('components/contributor-journey.tsx');
const sceneStep = await read('components/validated-scene-step.tsx');
const safetyStep = await read('components/safety-step.tsx');
const contributionDraft = await read('lib/contribution-draft.ts');
const storyTypes = await read('lib/types.ts');
const verifyAction = await read('app/submit/verify/actions.ts');
const submissionEmail = await read('lib/submission-auth-email.ts');
const submissionHandoff = await read('lib/submission-handoff.ts');
const finalizeRoute = await read('app/api/submission/finalize/route.ts');
const safetyRoute = await read('app/api/submission/safety/route.ts');
const authModule = await read('lib/auth.ts');
const profileMigration = await read('supabase/migrations/202608070001_resilient_profile_creation.sql');
const siteHeader = await read('components/site-header.tsx');
const siteFooter = await read('components/site-footer.tsx');
const performanceCss = await read('app/corporatex-performance.css');
const frozenHomepageCss = await read('app/frozen-homepage.css');
const frozenGlobalCss = await read('app/frozen-global.css');
const launchCss = await read('app/launch-readiness.css');
const frozenAssetCss = await read('app/frozen-assets.css');
const frozenAssetRoute = await read('app/frozen-assets/[asset]/route.ts');
const frozenAssetIndex = await read('lib/frozen-home-assets/index.ts');
const homePage = await read('app/page.tsx');
const morePage = await read('app/more/page.tsx');
const privacyPage = await read('app/privacy/page.tsx');
const loginPage = await read('app/login/page.tsx');
const storyPage = await read('app/experience/[companySlug]/[experienceSlug]/page.tsx');
const moderationPage = await read('app/moderation/page.tsx');
const moderationApi = await read('app/api/moderation/[id]/route.ts');
const accountPage = await read('app/account/page.tsx');

const requiredRuntimeDependencies = ['next','react','react-dom','@supabase/ssr','@supabase/supabase-js','googleapis','zod'];

test('Next.js production commands remain available with the static preview commands', () => {
  assert.equal(packageJson.scripts.dev, 'next dev');
  assert.equal(packageJson.scripts.build, 'next build');
  assert.match(packageJson.scripts.start, /next start/);
  assert.equal(packageJson.scripts['build:static'], 'node scripts/build.mjs');
  assert.equal(packageJson.scripts['check:server'], 'next build');
  assert.equal(packageJson.scripts['test:e2e'], 'playwright test');
});

test('server runtime and build dependencies are declared', () => {
  for (const dependency of requiredRuntimeDependencies) assert.ok(packageJson.dependencies?.[dependency], `${dependency} must be a runtime dependency`);
  for (const dependency of ['@playwright/test','vitest','typescript','tailwindcss','postcss','autoprefixer']) assert.ok(packageJson.devDependencies?.[dependency], `${dependency} must be a build dependency`);
  assert.equal(packageJson.dependencies?.['@google/genai'], undefined);
  assert.match(packageJson.engines.node, />=22/);
});

test('story analysis stays local and treats AI as an emergent signal rather than a mandatory beat', () => {
  assert.match(storyAnalysisModule, /const SAFETY_RULES/);
  assert.match(storyAnalysisModule, /identifyingIndicators/);
  assert.match(storyAnalysisModule, /shift_technology_followup/);
  assert.doesNotMatch(storyAnalysisModule, /GEMINI_API_KEY|@google\/genai|GoogleGenAI/);
  assert.match(analysisRunner, /does not send your story to an external AI service/);
  assert.match(storyTypes, /\['looking_back', 'Looking Back'/);
});

test('Render blueprint creates a Node web service with health check and private server secrets', () => {
  assert.match(renderBlueprint, /type: web/);
  assert.match(renderBlueprint, /runtime: node/);
  assert.match(renderBlueprint, /buildCommand: npm install --no-audit --no-fund && npm run build/);
  assert.match(renderBlueprint, /startCommand: npm run start/);
  assert.match(renderBlueprint, /healthCheckPath: \/api\/health/);
  assert.match(renderBlueprint, /key: SUPABASE_SERVICE_ROLE_KEY\s+sync: false/);
  assert.match(renderBlueprint, /key: GMAIL_USER\s+value: hrtechifyed@gmail\.com/);
});

test('health endpoint is independent from Supabase and returns no-store JSON', () => {
  assert.match(healthRoute, /service: 'corporatex'/);
  assert.match(healthRoute, /status: 'ok'/);
  assert.match(healthRoute, /Cache-Control': 'no-store'/);
  assert.doesNotMatch(healthRoute, /supabase|GMAIL|GOOGLE_/i);
});

test('Opening Signal is standalone and selecting a card automatically moves to Setting the Scene', () => {
  assert.match(submitPage, /OpeningSignalStep/);
  assert.match(submitPage, /8–12 minutes/);
  assert.match(contributorJourney, /How did this ending feel\?/);
  assert.match(contributorJourney, /Setting the Scene/);
  assert.match(contributorJourney, /router\.push\('\/submit\/scene'\)/);
  assert.match(contributorJourney, /role="radio"/);
});

test('the contribution stays pre-auth through Final Cut and Safety and requires deliberate context plus minimum substance', () => {
  assert.match(contributionDraft, /window\.localStorage/);
  assert.match(contributionDraft, /MIN_SUBSTANTIVE_STORY_CHARS/);
  assert.match(contributionDraft, /approximateTenure: ''/);
  assert.match(contributionDraft, /workArrangement: ''/);
  assert.match(sceneStep, /Choose tenure/);
  assert.match(sceneStep, /Choose arrangement/);
  assert.match(sceneStep, /Continue with this location/);
  assert.match(contributorJourney, /Review my story →/);
  assert.match(contributorJourney, /Run safety check →/);
  assert.match(contributorJourney, /hasSubstantiveStory/);
  assert.match(safetyStep, /It does not detect every identifying clue/);
  assert.match(safetyRoute, /contributionSubmissionSchema/);
  assert.match(safetyRoute, /analyseStory/);
  assert.doesNotMatch(safetyRoute, /requireProfile|auth\.getUser/);
});

test('verification creates a recoverable private handoff that can cross browsers or devices', () => {
  assert.match(verifyAction, /sendRecoverableSubmissionLink/);
  assert.match(verifyAction, /draftPayload/);
  assert.match(submissionEmail, /prepareSubmissionHandoff/);
  assert.match(submissionEmail, /another browser or device/);
  assert.match(submissionHandoff, /status: 'draft'/);
  assert.match(submissionHandoff, /guided_answers/);
  assert.doesNotMatch(verifyAction, /signInWithOtp|emailRedirectTo/);
});

test('verified finalization is authenticated, idempotent and never auto-publishes a new submission', () => {
  assert.match(finalizeRoute, /auth\.getUser\(\)/);
  assert.match(finalizeRoute, /status: 401/);
  assert.match(finalizeRoute, /idempotent: true/);
  assert.match(finalizeRoute, /status: 'awaiting_ai_analysis'/);
  assert.match(finalizeRoute, /status: 'awaiting_user_approval'/);
  assert.match(finalizeRoute, /status: 'pending_moderation'/);
  assert.doesNotMatch(finalizeRoute, /update\(\{ status: 'published'/);
  assert.match(finalizeRoute, /possibleIdentifyingDetails/);
  assert.match(finalizeRoute, /possibleAbusiveContent/);
});

test('new-user profile provisioning cannot block Supabase Auth and has a server fallback', () => {
  assert.match(profileMigration, /Never abort creation of auth\.users/);
  assert.match(profileMigration, /exception when others/);
  assert.match(authModule, /createAdminClient/);
  assert.match(authModule, /ensureProfileRecord/);
});

test('homepage preserves the approved proposition without fake production claims', () => {
  assert.match(homePage, /Not a score\./);
  assert.match(homePage, /cx-frozen-sequence/);
  assert.match(homePage, /Real stories\. Real people\. Real clarity\./);
  assert.match(homePage, /published_experiences.*count: 'exact'/s);
  assert.match(homePage, /Archive forming/);
  assert.match(homePage, /No demonstration account/);
  assert.doesNotMatch(homePage, /10K\+|professionals and counting/);
  assert.match(siteHeader, /HRTechify/);
  assert.match(siteHeader, /How It Works/);
});

test('frozen homepage artwork is cacheable and launch overrides use valid extensionless app routes', () => {
  assert.match(rootLayout, /frozen-homepage\.css/);
  assert.match(rootLayout, /frozen-assets\.css/);
  assert.match(rootLayout, /launch-readiness\.css/);
  assert.match(frozenHomepageCss, /cx-frozen-art/);
  for (const asset of ['hero','card-1','card-2','card-3','card-4','card-5']) assert.match(frozenAssetCss, new RegExp(`/frozen-assets/${asset}`));
  assert.match(frozenAssetIndex, /hero1 \+ hero2 \+ hero3 \+ hero4 \+ hero5 \+ hero6 \+ hero7/);
  assert.match(frozenAssetRoute, /Content-Type': 'image\/webp'/);
  assert.match(frozenAssetRoute, /max-age=31536000, immutable/);
  assert.match(launchCss, /url\('\/frozen-assets\/hero'\)/);
  assert.doesNotMatch(launchCss, /frozen-assets\/hero\.webp/);
});

test('global black-gold design remains intact while current launch overrides and cleanup layers are present', () => {
  assert.match(rootLayout, /frozen-global\.css/);
  assert.match(rootLayout, /card-footer-cleanup\.css/);
  assert.match(frozenGlobalCss, /body\.cx-body/);
  assert.match(frozenGlobalCss, /\.site-header/);
  assert.match(frozenGlobalCss, /\.site-footer/);
  assert.ok(rootLayout.indexOf('./launch-readiness.css') > rootLayout.indexOf('./frozen-global.css'));
  assert.match(siteFooter, /Workplace stories, structured for better career decisions\./);
  assert.match(siteFooter, /Contributor stories reflect individual perspectives and are moderated before publication\./);
  for (const [name, source] of Object.entries({ morePage, privacyPage, storyPage })) assert.match(source, /cx-frozen-mini-art/, `${name} should use approved visual language`);
});

test('moderation and account workflows satisfy the prelaunch trust gate', () => {
  assert.match(moderationPage, /What will be published/);
  assert.match(moderationPage, /Community report queue/);
  assert.match(moderationApi, /publicPreviewReviewed/);
  assert.match(accountPage, /In private review/);
  assert.match(accountPage, /Changes requested/);
  assert.match(accountPage, /\/account\/story\//);
});

test('CareerJarvis is removed from live public and contribution surfaces', () => {
  for (const [name, source] of Object.entries({ homePage, morePage, privacyPage, loginPage, storyPage, contributorJourney })) assert.doesNotMatch(source, /CareerJarvis|career-jarvis/, `${name} must not render CareerJarvis`);
});

test('route rendering keeps transition-lag safeguards', () => {
  assert.doesNotMatch(rootLayout, /force-dynamic/);
  assert.match(rootLayout, /corporatex-performance\.css/);
  assert.match(siteHeader, /router\.prefetch/);
  assert.match(performanceCss, /content-visibility:\s*auto/);
  assert.match(performanceCss, /@media \(prefers-reduced-motion: reduce\)/);
});

test('environment and CI do not require an external story-analysis key', () => {
  assert.doesNotMatch(envExample, /GEMINI_API_KEY/);
  assert.doesNotMatch(siteWorkflow, /GEMINI_API_KEY/);
});

test('CI installs dependencies and validates the server while Pages stays static', () => {
  assert.match(siteWorkflow, /npm install --no-audit --no-fund/);
  assert.match(siteWorkflow, /npm run check/);
  assert.match(pagesWorkflow, /npm install --no-audit --no-fund/);
  assert.match(pagesWorkflow, /npm run check:static/);
});
