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
  assert.match(packageJson.scripts.check, /check:static/);
  assert.match(packageJson.scripts.check, /check:server/);
});

test('server runtime and build dependencies are declared', () => {
  for (const dependency of requiredRuntimeDependencies) {
    assert.ok(packageJson.dependencies?.[dependency], `${dependency} must be a runtime dependency`);
  }
  for (const dependency of [
    '@playwright/test',
    'vitest',
    'typescript',
    'tailwindcss',
    'postcss',
    'autoprefixer',
  ]) {
    assert.ok(packageJson.devDependencies?.[dependency], `${dependency} must be a build dependency`);
  }
  assert.equal(packageJson.dependencies?.['@google/genai'], undefined);
  assert.match(packageJson.engines.node, />=22/);
});

test('story analysis is local and produces privacy-safe safety indicators', () => {
  assert.match(storyAnalysisModule, /const SAFETY_RULES/);
  assert.match(storyAnalysisModule, /possibleAbusiveContent/);
  assert.match(storyAnalysisModule, /identifyingIndicators/);
  assert.match(storyAnalysisModule, /analysisSchema\.parse/);
  assert.doesNotMatch(storyAnalysisModule, /GEMINI_API_KEY|@google\/genai|GoogleGenAI/);
  assert.match(analysisRunner, /does not send your story to an external AI service/);
});

test('Render blueprint creates a Node web service with a health check', () => {
  assert.match(renderBlueprint, /type: web/);
  assert.match(renderBlueprint, /runtime: node/);
  assert.match(renderBlueprint, /buildCommand: npm install --no-audit --no-fund && npm run build/);
  assert.match(renderBlueprint, /startCommand: npm run start/);
  assert.match(renderBlueprint, /healthCheckPath: \/api\/health/);
  assert.match(renderBlueprint, /key: GMAIL_USER\s+value: hrtechifyed@gmail\.com/);
  assert.match(renderBlueprint, /key: MODERATION_ALERT_EMAIL\s+value: hrtechifyed@gmail\.com/);
  assert.doesNotMatch(renderBlueprint, /GEMINI_API_KEY/);
  for (const secret of ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN']) {
    assert.match(renderBlueprint, new RegExp(`key: ${secret}\\s+sync: false`));
  }
});

test('health endpoint is independent from Supabase and returns no-store JSON', () => {
  assert.match(healthRoute, /service: 'corporatex'/);
  assert.match(healthRoute, /status: 'ok'/);
  assert.match(healthRoute, /Cache-Control': 'no-store'/);
  assert.doesNotMatch(healthRoute, /supabase|GMAIL|GOOGLE_/i);
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
