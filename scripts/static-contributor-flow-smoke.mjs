import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';

const port = 4174;
const base = `http://127.0.0.1:${port}`;
const server = spawn('python3', ['-m', 'http.server', String(port), '-d', 'dist'], { stdio: ['ignore', 'pipe', 'pipe'] });
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function waitForServer() {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try { if ((await fetch(base)).ok) return; } catch {}
    await delay(250);
  }
  throw new Error('Static contributor-flow server did not start.');
}

const mockSupabaseModule = `
export function createClient(){
  return {
    auth:{getSession:async()=>({data:{session:{user:{id:'00000000-0000-4000-8000-000000000001'}}},error:null})},
    functions:{invoke:async(name,{body}={})=>{globalThis.__cxSubmitCalls=globalThis.__cxSubmitCalls||[];globalThis.__cxSubmitCalls.push({name,body});return {data:{id:body?.draftId,status:'pending_moderation',liveLabels:['Growth']},error:null};}},
    from:()=>({select(){return this},eq(){return this},maybeSingle:async()=>({data:null,error:null}),insert:async()=>({data:null,error:null}),delete(){return this}})
  };
}`;

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.route('**/supabase-js@2/+esm', (route) => route.fulfill({ status: 200, contentType: 'application/javascript', body: mockSupabaseModule }));
  await page.goto(`${base}/guided-story.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-guided-ending-panel]');

  const start = await page.evaluate(() => ({ endings: document.querySelectorAll('.cx-ending-card').length, contextHidden: getComputedStyle(document.querySelector('[data-guided-context]')).display === 'none' }));
  if (start.endings !== 4 || !start.contextHidden) throw new Error('Share Your Story must start with exactly four endings before context.');

  await page.click('[data-ending="break-free"]');
  await page.fill('[data-guided-company]', 'Quality Test Company');
  await page.fill('[data-guided-location]', 'Remote — Europe');
  await page.fill('[data-guided-team]', 'Product');
  await page.click('[data-guided-context-next]');
  await page.waitForSelector('.ref-journey-card.is-active:visible');
  const beatArt = await page.evaluate(() => { const card=document.querySelector('.ref-journey-card.is-active'); const svg=card?.querySelector('.ref-art-svg'); return { background:getComputedStyle(card,'::before').backgroundImage, svgDisplay:svg?getComputedStyle(svg).display:'' }; });
  if (!beatArt.background.includes('frozen-assets') || beatArt.svgDisplay !== 'none') throw new Error('Story Beats must use the production anime card treatment.');

  await page.fill('[data-guided-text]', 'I joined for growth and learning. The workload later changed and the role became difficult to sustain.');
  await page.click('[data-guided-review]');
  await page.check('[data-guided-agreement]');
  await page.click('[data-guided-confirm]');
  await page.waitForFunction(() => Array.isArray(globalThis.__cxSubmitCalls) && globalThis.__cxSubmitCalls.length === 1);
  const submitted = await page.evaluate(() => globalThis.__cxSubmitCalls[0]);
  if (submitted.name !== 'submit-story') throw new Error('Final safety confirmation did not invoke submit-story.');
  if (submitted.body?.ending !== 'break-free') throw new Error('Chosen ending was lost before submission.');
  if (submitted.body?.context?.company !== 'Quality Test Company') throw new Error('Story context was lost before submission.');
  if (!submitted.body?.chapters?.some((chapter) => chapter.response?.includes('growth and learning'))) throw new Error('Story Beat response was lost before submission.');
  await page.close();

  const home = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await home.route('**/supabase-js@2/+esm', (route) => route.fulfill({ status: 200, contentType: 'application/javascript', body: mockSupabaseModule }));
  await home.route('**/rest/v1/published_experiences**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await home.route('**/rest/v1/live_story_signals**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ label:'Growth', pending_count:1, confirmed_count:0, total_count:1 },{ label:'Workload', pending_count:0, confirmed_count:2, total_count:2 }]) }));
  await home.goto(base, { waitUntil: 'domcontentloaded' });
  await home.waitForSelector('.cx-live-signal');
  const signalText = await home.locator('.cx-live-signal').allTextContents();
  if (!signalText.includes('Growth') || !signalText.includes('Workload')) throw new Error('Homepage live signal cloud did not hydrate from safe aggregated labels.');
  await home.close();

  console.log('Contributor-flow smoke passed: ending selection, anime Story Beats, safety submit invocation and live signal cloud are connected.');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
