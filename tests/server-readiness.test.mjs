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
const contributionDraft = await read('lib/contribution-draft.ts');
const storyTypes = await read('lib/types.ts');
const verifyAction = await read('app/submit/verify/actions.ts');
const finalizeRoute = await read('app/api/submission/finalize/route.ts');
const safetyRoute = await read('app/api/submission/safety/route.ts');
const authModule = await read('lib/auth.ts');
const profileMigration = await read('supabase/migrations/202608070001_resilient_profile_creation.sql');
const siteHeader = await read('components/site-header.tsx');
const performanceCss = await read('app/corporatex-performance.css');
const frozenHomepageCss = await read('app/frozen-homepage.css');
const frozenAssetCss = await read('app/frozen-assets.css');
const frozenAssetRoute = await read('app/frozen-assets/[asset]/route.ts');
const frozenAssetIndex = await read('lib/frozen-home-assets/index.ts');
const homePage = await read('app/page.tsx');
const morePage = await read('app/more/page.tsx');
const privacyPage = await read('app/privacy/page.tsx');
const loginPage = await read('app/login/page.tsx');
const storyPage = await read('app/experience/[companySlug]/[experienceSlug]/page.tsx');

const requiredRuntimeDependencies = [
  'next',
  'react',
  'react-dom',
  '@supabase/ssr',
  '@supabase/supabase-js',
  'googleapis',
  'zod',
];

test('Next.js production commands are available without removing static commands', () => {
  assert.equal(packageJson.scripts.dev, 'next dev');
  assert.equal(packageJson.scripts.build, 'next build');
  assert.match(packageJson.scripts.start, /next start/);
  assert.equal(packageJson.scripts['build:static'], 'node scripts/build.mjs');
  assert.equal(packageJson.scripts['check:server'], 'next build');
  assert.equal(packageJson.scripts['test:e2e'], 'playwright test');
  assert.match(packageJson.scripts.check, /check:static/);
  assert.match(packageJson.scripts.check, /check:server/);
});

test('server runtime and build dependencies are declared', () => {
  for (const dependency of requiredRuntimeDependencies) assert.ok(packageJson.dependencies?.[dependency], `${dependency} must be a runtime dependency`);
  for (const dependency of ['@playwright/test','vitest','typescript','tailwindcss','postcss','autoprefixer']) assert.ok(packageJson.devDependencies?.[dependency], `${dependency} must be a build dependency`);
  assert.equal(packageJson.dependencies?.['@google/genai'], undefined);
  assert.match(packageJson.engines.node, />=22/);
});

test('story analysis stays local and treats AI as an emergent signal rather than a mandatory beat', () => {
  assert.match(storyAnalysisModule, /const SAFETY_RULES/);
  assert.match(storyAnalysisModule, /possibleAbusiveContent/);
  assert.match(storyAnalysisModule, /identifyingIndicators/);
  assert.match(storyAnalysisModule, /shift_technology_followup/);
  assert.doesNotMatch(storyAnalysisModule, /GEMINI_API_KEY|@google\/genai|GoogleGenAI/);
  assert.match(analysisRunner, /does not send your story to an external AI service/);
  assert.match(storyTypes, /\['looking_back', 'Looking Back'/);
  assert.doesNotMatch(storyTypes, /\['ai_turn'|The AI Turn/);
});

test('Render blueprint creates a Node web service with a health check', () => {
  assert.match(renderBlueprint, /type: web/);
  assert.match(renderBlueprint, /runtime: node/);
  assert.match(renderBlueprint, /buildCommand: npm install --no-audit --no-fund && npm run build/);
  assert.match(renderBlueprint, /startCommand: npm run start/);
  assert.match(renderBlueprint, /healthCheckPath: \/api\/health/);
  assert.match(renderBlueprint, /key: SUPABASE_SERVICE_ROLE_KEY\s+sync: false/);
  assert.match(renderBlueprint, /key: GMAIL_USER\s+value: hrtechifyed@gmail\.com/);
  assert.doesNotMatch(renderBlueprint, /GEMINI_API_KEY/);
});

test('health endpoint is independent from Supabase and returns no-store JSON', () => {
  assert.match(healthRoute, /service: 'corporatex'/);
  assert.match(healthRoute, /status: 'ok'/);
  assert.match(healthRoute, /Cache-Control': 'no-store'/);
  assert.doesNotMatch(healthRoute, /supabase|GMAIL|GOOGLE_/i);
});

test('Opening Signal is standalone and selecting a card automatically moves to Set the Scene', () => {
  assert.match(submitPage, /OpeningSignalStep/);
  assert.doesNotMatch(submitPage, /createDraft|Set the Scene|requireProfile/);
  assert.match(contributorJourney, /How did this ending feel\?/);
  assert.match(contributorJourney, /router\.push\('\/submit\/scene'\)/);
  assert.match(contributorJourney, /role="radio"/);
  assert.match(contributorJourney, /aria-checked=\{isSelected\}/);
  assert.doesNotMatch(contributorJourney, /Continue to Set the Scene/);
});

test('the contribution stays pre-auth until Final Cut and Safety are complete', () => {
  assert.match(contributionDraft, /window\.localStorage/);
  assert.match(contributorJourney, /Where did this story unfold\?/);
  assert.match(contributorJourney, /Review my story →/);
  assert.match(contributorJourney, /Run safety check →/);
  assert.match(contributorJourney, /Verify &amp; submit →/);
  assert.match(contributorJourney, /technology-ai/);
  assert.match(contributorJourney, /Technology \/ AI follow-up · optional/);
  assert.doesNotMatch(contributorJourney, /CareerJarvis/);
  assert.match(safetyRoute, /contributionSubmissionSchema/);
  assert.match(safetyRoute, /analyseStory/);
  assert.doesNotMatch(safetyRoute, /requireProfile|auth\.getUser/);
  assert.match(verifyAction, /emailRedirectTo: `\$\{origin\}\/auth\/callback\?next=\$\{encodeURIComponent\('\/submit\/finish'\)\}`/);
});

test('verified finalization creates the database record only after authentication and keeps moderation private', () => {
  assert.match(finalizeRoute, /auth\.getUser\(\)/);
  assert.match(finalizeRoute, /if \(userError \|\| !user\).*status: 401/);
  assert.match(finalizeRoute, /status: 'draft'/);
  assert.match(finalizeRoute, /status: 'awaiting_ai_analysis'/);
  assert.match(finalizeRoute, /status: 'awaiting_user_approval'/);
  assert.match(finalizeRoute, /status: 'pending_moderation'/);
  assert.doesNotMatch(finalizeRoute, /status: 'published'/);
  assert.match(finalizeRoute, /possibleIdentifyingDetails/);
  assert.match(finalizeRoute, /possibleAbusiveContent/);
});

test('new-user profile provisioning cannot block Supabase Auth and has a server fallback', () => {
  assert.match(profileMigration, /Never abort creation of auth\.users/);
  assert.match(profileMigration, /exception when others/);
  assert.match(profileMigration, /return new;/);
  assert.match(authModule, /createAdminClient/);
  assert.match(authModule, /ensureProfileRecord/);
  assert.doesNotMatch(authModule, /supabase\.from\('profiles'\)\.insert/);
});

test('the frozen homepage matches the approved visual contract without fake production claims', () => {
  assert.match(homePage, /Not a score\./);
  assert.match(homePage, /cx-frozen-sequence/);
  assert.match(homePage, /A rating gives you a reaction\. A story shows what was promised, what changed and what to ask before joining\./);
  assert.match(homePage, /Real stories\. Real people\. Real clarity\./);
  assert.match(homePage, /Array\.from\(\{ length: 5 \}/);
  assert.match(homePage, /published_experiences.*count: 'exact'/s);
  assert.match(homePage, /No demo account/);
  assert.doesNotMatch(homePage, /10K\+|professionals and counting/);
  assert.doesNotMatch(homePage, /cx-signal-visual/);
  assert.match(siteHeader, /HRTechify/);
  assert.match(siteHeader, /Corporate<span className="cx-brand-x">X<\/span>/);
  assert.match(siteHeader, /How It Works/);
  assert.match(siteHeader, /cx-sign-in/);
  assert.match(morePage, /id="how-it-works"/);
});

test('frozen homepage artwork is cacheable and uses the five approved anime story scenes', () => {
  assert.match(rootLayout, /frozen-homepage\.css/);
  assert.match(rootLayout, /frozen-assets\.css/);
  assert.match(frozenHomepageCss, /cx-frozen-art/);
  assert.match(frozenHomepageCss, /grid-template-columns:repeat\(5/);
  assert.match(frozenHomepageCss, /@media \(prefers-reduced-motion: reduce\)/);
  for (const asset of ['hero','card-1','card-2','card-3','card-4','card-5']) assert.match(frozenAssetCss, new RegExp(`/frozen-assets/${asset}`));
  assert.match(frozenAssetIndex, /hero1 \+ hero2 \+ hero3 \+ hero4 \+ hero5 \+ hero6 \+ hero7/);
  assert.match(frozenAssetRoute, /Content-Type': 'image\/webp'/);
  assert.match(frozenAssetRoute, /max-age=31536000, immutable/);
});

test('CareerJarvis is removed from live public and contribution surfaces', () => {
  for (const [name, source] of Object.entries({ homePage, morePage, privacyPage, loginPage, storyPage, contributorJourney })) {
    assert.doesNotMatch(source, /CareerJarvis|career-jarvis/, `${name} must not render CareerJarvis`);
  }
  assert.match(morePage, /cx-signal-visual/);
  assert.match(privacyPage, /cx-signal-visual/);
});

test('route rendering keeps the previous transition-lag safeguards', () => {
  assert.doesNotMatch(rootLayout, /force-dynamic/);
  assert.match(rootLayout, /corporatex-performance\.css/);
  assert.match(rootLayout, /contributor-journey\.css/);
  assert.match(siteHeader, /router\.prefetch/);
  assert.match(siteHeader, /data-route-pending/);
  assert.match(performanceCss, /content-visibility:\s*auto/);
  assert.match(performanceCss, /contain:\s*layout paint/);
  assert.match(performanceCss, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(performanceCss, /transition:\s*all/);
});

test('environment and CI do not require an external story-analysis key', () => {
  assert.doesNotMatch(envExample, /GEMINI_API_KEY/);
  assert.doesNotMatch(siteWorkflow, /GEMINI_API_KEY/);
});

test('CI installs dependencies and validates the server while Pages stays static', () => {
  assert.match(siteWorkflow, /npm install --no-audit --no-fund/);
  assert.match(siteWorkflow, /npm run check/);
  assert.match(siteWorkflow, /NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(pagesWorkflow, /npm install --no-audit --no-fund/);
  assert.match(pagesWorkflow, /npm run check:static/);
  assert.doesNotMatch(pagesWorkflow, /npm run check\s*$/m);
});
