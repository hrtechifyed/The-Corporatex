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
const session=()=>globalThis.__cxMockSession?{user:{id:'00000000-0000-4000-8000-000000000001',email:'tester@example.com'}}:null;
export function createClient(){
  return {
    auth:{
      getSession:async()=>({data:{session:session()},error:null}),
      signUp:async(input)=>{globalThis.__cxAuthCalls=globalThis.__cxAuthCalls||[];globalThis.__cxAuthCalls.push({method:'signUp',input});globalThis.__cxMockSession=true;return {data:{session:session(),user:session()?.user},error:null};},
      signInWithPassword:async(input)=>{globalThis.__cxAuthCalls=globalThis.__cxAuthCalls||[];globalThis.__cxAuthCalls.push({method:'signInWithPassword',input});globalThis.__cxMockSession=true;return {data:{session:session(),user:session()?.user},error:null};}
    },
    functions:{invoke:async(name,{body}={})=>{globalThis.__cxSubmitCalls=globalThis.__cxSubmitCalls||[];globalThis.__cxSubmitCalls.push({name,body});return {data:{id:body?.draftId,status:'pending_moderation',liveLabels:['Growth'],emailQueued:true},error:null};}},
    from:()=>({select(){return this},eq(){return this},maybeSingle:async()=>({data:null,error:null}),insert:async()=>({data:null,error:null}),delete(){return this}})
  };
}`;

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => { globalThis.__cxMockSession = false; });
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
  if (!/(hero\.webp|card-5\.webp)/.test(beatArt.background) || beatArt.svgDisplay !== 'none') throw new Error('Story Beats must use cinematic anime artwork rather than the flat scene illustration.');

  await page.fill('[data-guided-text]', 'I joined for growth and learning. The workload later changed and the role became difficult to sustain.');
  await page.click('[data-guided-review]');
  await page.check('[data-guided-agreement]');
  const confirmText = await page.locator('[data-guided-confirm]').textContent();
  if (!/Click here to submit/i.test(confirmText || '')) throw new Error('Final Cut must use the direct submit label.');
  await page.click('[data-guided-confirm]');
  await page.waitForSelector('[data-cx-submit-account]:visible');
  await page.fill('[data-cx-submit-account] input[name="email"]', 'tester@example.com');
  await page.fill('[data-cx-submit-account] input[name="password"]', 'CorporateX!2026');
  await page.click('[data-cx-account-submit]');
  await page.waitForFunction(() => Array.isArray(globalThis.__cxSubmitCalls) && globalThis.__cxSubmitCalls.length === 1);
  const state = await page.evaluate(() => ({ submit: globalThis.__cxSubmitCalls[0], auth: globalThis.__cxAuthCalls || [] }));
  if (state.auth[0]?.method !== 'signUp') throw new Error('New contributor path must create an email/password account before submission.');
  if (String(state.auth[0]?.input?.password || '').length < 10) throw new Error('Contributor password requirement must be at least 10 characters.');
  if (state.submit.name !== 'submit-story') throw new Error('Password account completion did not invoke submit-story.');
  if (state.submit.body?.ending !== 'break-free') throw new Error('Chosen ending was lost before submission.');
  if (state.submit.body?.context?.company !== 'Quality Test Company') throw new Error('Story context was lost before submission.');
  if (!state.submit.body?.chapters?.some((chapter) => chapter.response?.includes('growth and learning'))) throw new Error('Story Beat response was lost before submission.');
  await page.close();

  const home = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await home.addInitScript(() => { globalThis.__cxMockSession = false; });
  await home.route('**/supabase-js@2/+esm', (route) => route.fulfill({ status: 200, contentType: 'application/javascript', body: mockSupabaseModule }));
  await home.route('**/rest/v1/published_experiences**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await home.route('**/rest/v1/live_story_signals**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ label:'Growth', pending_count:1, confirmed_count:0, total_count:1 },{ label:'Workload', pending_count:0, confirmed_count:2, total_count:2 }]) }));
  await home.goto(base, { waitUntil: 'domcontentloaded' });
  await home.waitForSelector('.cx-live-signal');
  const signalText = await home.locator('.cx-live-signal').allTextContents();
  if (!signalText.includes('Growth') || !signalText.includes('Workload')) throw new Error('Homepage live signal cloud did not hydrate from safe aggregated labels.');
  await home.close();

  console.log('Contributor-flow smoke passed: endings, anime Story Beats, email/password account creation, safety submission and live signals are connected.');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
