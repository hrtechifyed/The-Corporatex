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
const locations=[
 {display_name:'Hamburg, Germany',category:'city',priority:20},
 {display_name:'Hyderabad, India',category:'city',priority:10},
 {display_name:'Remote',category:'remote',priority:1},
 {display_name:'Other',category:'other',priority:2}
];
const session=()=>globalThis.__cxMockSession?{user:{id:'00000000-0000-4000-8000-000000000001',email:'tester@example.com'}}:null;
function builder(table){
 let rows=table==='story_locations'?locations:[];
 return {
  select(){return this},
  eq(column,value){if(table==='story_locations'&&column==='is_active'&&value!==true)rows=[];return this},
  ilike(){return this},
  order(){return this},
  limit(){return this},
  maybeSingle:async()=>({data:null,error:null}),
  insert:async()=>({data:null,error:null}),
  delete(){return this},
  then(resolve,reject){return Promise.resolve({data:rows,error:null}).then(resolve,reject)}
 };
}
export function createClient(){
  return {
    auth:{
      getSession:async()=>({data:{session:session()},error:null}),
      signUp:async(input)=>{
        globalThis.__cxAuthCalls=globalThis.__cxAuthCalls||[];globalThis.__cxAuthCalls.push({method:'signUp',input});
        if(globalThis.__cxExistingAccount)return {data:{session:null,user:{id:'00000000-0000-4000-8000-000000000001',email:input.email,identities:[]}},error:null};
        globalThis.__cxMockSession=true;
        return {data:{session:session(),user:{...session()?.user,identities:[{provider:'email'}]}},error:null};
      },
      signInWithPassword:async(input)=>{globalThis.__cxAuthCalls=globalThis.__cxAuthCalls||[];globalThis.__cxAuthCalls.push({method:'signInWithPassword',input});globalThis.__cxMockSession=true;return {data:{session:session(),user:session()?.user},error:null};}
    },
    functions:{invoke:async(name,{body}={})=>{globalThis.__cxSubmitCalls=globalThis.__cxSubmitCalls||[];globalThis.__cxSubmitCalls.push({name,body});return {data:{id:body?.draftId,status:'pending_moderation',liveLabels:['Growth'],emailQueued:true},error:null};}},
    from:(table)=>builder(table)
  };
}`;

function globalLocationResults(query) {
  const q = String(query || '').toLowerCase();
  const city = (display_name, city, country_code, state_code, state, country) => ({ display_name, category:'city', city, country_code, state_code, state, country });
  if (!q) return { results:[{display_name:'Remote',category:'remote',city:'',country_code:'',state_code:'',state:'',country:''},{display_name:'Other',category:'other',city:'',country_code:'',state_code:'',state:'',country:''}], more:false };
  if (q === 'h') return { results:[
    city('Hamburg, Hamburg, Germany','Hamburg','DE','HH','Hamburg','Germany'),
    city('Hanoi, Hanoi, Vietnam','Hanoi','VN','HN','Hanoi','Vietnam'),
    city('Helsinki, Uusimaa, Finland','Helsinki','FI','18','Uusimaa','Finland'),
    city('Houston, Texas, United States','Houston','US','TX','Texas','United States'),
    city('Hyderabad, Sindh, Pakistan','Hyderabad','PK','SD','Sindh','Pakistan'),
    city('Hyderabad, Telangana, India','Hyderabad','IN','TG','Telangana','India'),
  ], more:true };
  if (q === 'hy') return { results:[
    city('Hyderabad, Sindh, Pakistan','Hyderabad','PK','SD','Sindh','Pakistan'),
    city('Hyderabad, Telangana, India','Hyderabad','IN','TG','Telangana','India'),
  ], more:false };
  return { results:[], more:false };
}

async function mockGlobalLocationSearch(page) {
  await page.route('**/functions/v1/search-locations**', (route) => {
    const url = new URL(route.request().url());
    const payload = globalLocationResults(url.searchParams.get('q') || '');
    route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify({ ...payload, attribution:'Countries States Cities Database · ODbL' }) });
  });
}

async function prepareStory(page, { company = 'Quality Test Company' } = {}) {
  await page.goto(`${base}/guided-story.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-guided-ending-panel]');
  const start = await page.evaluate(() => ({ endings: document.querySelectorAll('.cx-ending-card').length, contextHidden: getComputedStyle(document.querySelector('[data-guided-context]')).display === 'none' }));
  if (start.endings !== 4 || !start.contextHidden) throw new Error('Share Your Story must start with exactly four endings before context.');
  await page.click('[data-ending="break-free"]');
  await page.fill('[data-guided-company]', company);

  await page.click('[data-guided-location]');
  await page.waitForSelector('.cx-location-option');
  const specialOptions = await page.locator('.cx-location-option strong').allTextContents();
  if (!specialOptions.includes('Remote') || !specialOptions.includes('Other')) throw new Error('Location picker must offer Remote and Other as explicit choices.');

  await page.fill('[data-guided-location]', 'H');
  await page.waitForFunction(() => document.querySelectorAll('.cx-location-option').length >= 5);
  const hSuggestions = await page.locator('.cx-location-option strong').allTextContents();
  if (!hSuggestions.includes('Hamburg, Hamburg, Germany') || !hSuggestions.includes('Hyderabad, Telangana, India') || hSuggestions.length < 5) throw new Error('Typing H must search the worldwide city catalogue.');

  await page.fill('[data-guided-location]', 'Hy');
  await page.waitForFunction(() => document.querySelectorAll('.cx-location-option').length === 2);
  const narrowed = await page.locator('.cx-location-option strong').allTextContents();
  if (!narrowed.includes('Hyderabad, Sindh, Pakistan') || !narrowed.includes('Hyderabad, Telangana, India')) throw new Error('Global location search must disambiguate cities with the same name.');
  await page.locator('.cx-location-option', { hasText:'Hyderabad, Telangana, India' }).click();
  if ((await page.inputValue('[data-guided-location]')) !== 'Hyderabad, Telangana, India') throw new Error('Selected global city was not normalized into the field.');

  await page.fill('[data-guided-team]', 'P');
  await page.waitForSelector('.cx-role-option');
  const roleSuggestions = await page.locator('.cx-role-option strong').allTextContents();
  if (!roleSuggestions.includes('Product Manager') || !roleSuggestions.includes('Product Engineer') || !roleSuggestions.includes('Project Manager')) throw new Error('Typing P must show prominent matching role suggestions.');
  if (roleSuggestions.some((title) => !title.toLowerCase().startsWith('p'))) throw new Error('Role suggestions must use strict prefix matching.');
  await page.locator('.cx-role-option', { hasText:'Product Engineer' }).click();
  if ((await page.inputValue('[data-guided-team]')) !== 'Product Engineer') throw new Error('Selected role was not applied to the context field.');

  await page.fill('[data-guided-left-date]', '0624');
  if ((await page.inputValue('[data-guided-left-date]')) !== '06/24') throw new Error('Leaving month must format MMYY input as MM/YY.');

  await page.click('[data-guided-context-next]');
  await page.waitForSelector('.ref-journey-card.is-active:visible');
  const beatArt = await page.evaluate(() => {
    const card = document.querySelector('.ref-journey-card.is-active');
    const svg = card?.querySelector('.ref-art-svg');
    const style = svg ? getComputedStyle(svg) : null;
    return {
      svgBackground: style?.backgroundImage || '',
      svgDisplay: style?.display || '',
      svgVisibility: style?.visibility || '',
      svgOpacity: style?.opacity || '',
    };
  });
  if (!/card-1\.webp/.test(beatArt.svgBackground) || beatArt.svgDisplay === 'none' || beatArt.svgVisibility !== 'visible' || Number(beatArt.svgOpacity) < .99) {
    throw new Error('The highlighted Story Beat must keep its clear cinematic artwork visible.');
  }
  await page.fill('[data-guided-text]', 'I joined for growth and learning. The workload later changed and the role became difficult to sustain.');
  await page.click('[data-guided-review]');
  const reviewContext = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('.ref-context-review > div')].map((item) => [item.querySelector('dt')?.textContent?.trim(), item.querySelector('dd')?.textContent?.trim()])));
  if (reviewContext.Role !== 'Product Engineer' || reviewContext.Left !== '06/24') throw new Error('Final Cut must show the selected role and leaving month.');
  await page.check('[data-guided-agreement]');
  const confirmText = await page.locator('[data-guided-confirm]').textContent();
  if (!/Click here to submit/i.test(confirmText || '')) throw new Error('Final Cut must use the direct submit label.');
  await page.click('[data-guided-confirm]');
  await page.waitForSelector('[data-cx-submit-account]:visible');
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless:true });

  const page = await browser.newPage({ viewport:{ width:1440, height:900 } });
  await page.addInitScript(() => { globalThis.__cxMockSession = false; globalThis.__cxExistingAccount = false; });
  await page.route('**/supabase-js@2/+esm', (route) => route.fulfill({ status:200, contentType:'application/javascript', body:mockSupabaseModule }));
  await mockGlobalLocationSearch(page);
  await prepareStory(page);
  await page.fill('[data-cx-submit-account] input[name="email"]', 'tester@example.com');
  await page.fill('[data-cx-submit-account] input[name="password"]', 'CorporateX!2026');
  await page.click('[data-cx-account-submit]');
  await page.waitForFunction(() => Array.isArray(globalThis.__cxSubmitCalls) && globalThis.__cxSubmitCalls.length === 1);
  const state = await page.evaluate(() => ({ submit:globalThis.__cxSubmitCalls[0], auth:globalThis.__cxAuthCalls || [] }));
  if (state.auth[0]?.method !== 'signUp') throw new Error('New contributor path must create an email/password account before submission.');
  if (String(state.auth[0]?.input?.password || '').length < 10) throw new Error('Contributor password requirement must be at least 10 characters.');
  if (state.submit.name !== 'submit-story') throw new Error('Password account completion did not invoke submit-story.');
  if (state.submit.body?.ending !== 'break-free') throw new Error('Chosen ending was lost before submission.');
  if (state.submit.body?.context?.company !== 'Quality Test Company') throw new Error('Story context was lost before submission.');
  if (state.submit.body?.context?.location !== 'Hyderabad, Telangana, India') throw new Error('Validated global city was lost before submission.');
  if (state.submit.body?.context?.role !== 'Product Engineer' || state.submit.body?.context?.team !== 'Product Engineer') throw new Error('Role context was lost before submission.');
  if (state.submit.body?.context?.leftDate !== '06/24' || state.submit.body?.context?.departureMonth !== '2024-06-01') throw new Error('Leaving month context was lost before submission.');
  if (state.submit.body?.locationSelection?.kind !== 'city' || state.submit.body?.locationSelection?.city !== 'Hyderabad' || state.submit.body?.locationSelection?.countryCode !== 'IN' || state.submit.body?.locationSelection?.stateCode !== 'TG') throw new Error('Validated global location metadata was lost before submission.');
  if (!state.submit.body?.chapters?.some((chapter) => chapter.response?.includes('growth and learning'))) throw new Error('Story Beat response was lost before submission.');
  await page.close();

  const returning = await browser.newPage({ viewport:{ width:1440, height:900 } });
  await returning.addInitScript(() => { globalThis.__cxMockSession = false; globalThis.__cxExistingAccount = true; });
  await returning.route('**/supabase-js@2/+esm', (route) => route.fulfill({ status:200, contentType:'application/javascript', body:mockSupabaseModule }));
  await mockGlobalLocationSearch(returning);
  await prepareStory(returning, { company:'Returning User Company' });
  await returning.fill('[data-cx-submit-account] input[name="email"]', 'returning@example.com');
  await returning.fill('[data-cx-submit-account] input[name="password"]', 'Returning!2026');
  await returning.click('[data-cx-account-submit]');
  await returning.waitForFunction(() => /already has a CorporateX account/i.test(document.querySelector('[data-cx-account-status]')?.textContent || ''));
  const beforeSignin = await returning.evaluate(() => ({ auth:globalThis.__cxAuthCalls||[], submits:globalThis.__cxSubmitCalls||[], button:document.querySelector('[data-cx-account-submit]')?.textContent }));
  if (beforeSignin.auth[0]?.method !== 'signUp' || beforeSignin.submits.length !== 0 || !/Sign in & submit/i.test(beforeSignin.button || '')) throw new Error('Existing email must switch to password sign-in without submitting.');
  await returning.click('[data-cx-account-submit]');
  await returning.waitForFunction(() => Array.isArray(globalThis.__cxSubmitCalls) && globalThis.__cxSubmitCalls.length === 1);
  const returningState = await returning.evaluate(() => ({ auth:globalThis.__cxAuthCalls||[], submit:globalThis.__cxSubmitCalls?.[0] }));
  if (returningState.auth[1]?.method !== 'signInWithPassword') throw new Error('Returning contributor must sign in with password before submission.');
  if (returningState.submit?.name !== 'submit-story') throw new Error('Returning contributor sign-in did not continue to submit-story.');
  await returning.close();

  const home = await browser.newPage({ viewport:{ width:1440, height:900 } });
  await home.addInitScript(() => { globalThis.__cxMockSession = false; globalThis.__cxExistingAccount = false; });
  await home.route('**/supabase-js@2/+esm', (route) => route.fulfill({ status:200, contentType:'application/javascript', body:mockSupabaseModule }));
  await home.route('**/rest/v1/published_experiences**', (route) => route.fulfill({ status:200, contentType:'application/json', body:'[]' }));
  await home.route('**/rest/v1/live_story_signals**', (route) => route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify([{ label:'Growth', pending_count:1, confirmed_count:0, total_count:1 },{ label:'Workload', pending_count:0, confirmed_count:2, total_count:2 }]) }));
  await home.goto(base, { waitUntil:'domcontentloaded' });
  await home.waitForSelector('.cx-live-signal');
  const signalText = await home.locator('.cx-live-signal').allTextContents();
  if (!signalText.includes('Growth') || !signalText.includes('Workload')) throw new Error('Homepage live signal cloud did not hydrate from safe aggregated labels.');
  await home.close();

  console.log('Contributor-flow smoke passed: global city search, role suggestions, leaving month, Remote/Other options, visible anime Story Beats, account access, submission and live signals are connected.');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
