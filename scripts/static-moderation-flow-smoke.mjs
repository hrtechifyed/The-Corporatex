import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';

const port = 4175;
const base = `http://127.0.0.1:${port}`;
const storyId = '11111111-1111-4111-8111-111111111111';
const server = spawn('python3', ['-m', 'http.server', String(port), '-d', 'dist'], { stdio: ['ignore', 'pipe', 'pipe'] });
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function waitForServer() {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try { if ((await fetch(base)).ok) return; } catch {}
    await delay(250);
  }
  throw new Error('Static moderation-flow server did not start.');
}

const mockSupabaseModule = `
const storyId='${storyId}';
const getStory=()=>globalThis.__cxStory||{
 id:storyId,status:globalThis.__cxInitialStatus||'pending_moderation',approved_headline:'A role that changed over time',approved_summary:'The contributor joined for growth, then experienced a material shift in workload and role expectations.',ending_type:'next-act',broad_function:'Product',broad_region:'Hyderabad, India',created_at:'2026-08-14T04:00:00Z',updated_at:'2026-08-14T04:10:00Z',published_at:null,public_slug:null,ai_analysis:{suggestedLabels:['Growth'],possibleIdentifyingDetails:[],possibleAbusiveContent:[]},original_text:'The Beginning: I joined for growth. The Shift: Workload changed.',companies:{display_name:'Quality Test Company'},profiles:{hrt_id:'HRT-ABC234567'}
};
const answers=[{question_key:'beginning',answer:'I joined for growth and learning.',sort_order:1},{question_key:'shift',answer:'The workload and expectations changed significantly.',sort_order:2}];
const update={action:'request_changes',contributor_message:'Please make the timing less specific and keep individual names out.',created_at:'2026-08-14T04:12:00Z'};
function resultFor(table,filters){
 const story=getStory();
 if(table==='profiles') return [{role:globalThis.__cxRole||'moderator',account_status:'active',hrt_id:'HRT-MOD234567'}];
 if(table==='experiences') {
  if(filters.id && filters.id!==story.id)return [];
  if(filters.status && filters.status!==story.status)return [];
  return [story];
 }
 if(table==='guided_answers') return answers;
 if(table==='experience_labels') return [{label:'Growth'},{label:'Workload'}];
 if(table==='moderation_actions') return story.status==='pending_moderation'?[]:[update];
 if(table==='contributor_moderation_updates') return [update];
 return [];
}
function builder(table){
 const filters={};
 return {
  select(){return this},
  eq(column,value){filters[column]=value;return this},
  not(){return this},
  order(){return this},
  limit(){return this},
  in(){return this},
  single:async()=>{const rows=resultFor(table,filters);return {data:rows[0]||null,error:rows[0]?null:{message:'Not found'}}},
  maybeSingle:async()=>{const rows=resultFor(table,filters);return {data:rows[0]||null,error:null}},
  then(resolve,reject){return Promise.resolve({data:resultFor(table,filters),error:null}).then(resolve,reject)}
 };
}
export function createClient(){
 return {
  auth:{getSession:async()=>({data:{session:{user:{id:globalThis.__cxRole==='contributor'?'00000000-0000-4000-8000-000000000002':'00000000-0000-4000-8000-000000000001',email:'tester@example.com'}}},error:null}),signOut:async()=>({error:null})},
  from:(table)=>builder(table),
  rpc:async(name,params)=>{
    globalThis.__cxRpcCalls=globalThis.__cxRpcCalls||[];globalThis.__cxRpcCalls.push({name,params});
    const story=getStory();
    if(name==='moderate_experience'){
      story.status=params.p_action==='publish'?'published':params.p_action==='reject'?'rejected':'changes_requested';
      globalThis.__cxStory=story;
      return {data:{id:story.id,status:story.status,public_slug:story.status==='published'?'quality-test-story':null},error:null};
    }
    if(name==='resubmit_experience'){
      story.status='pending_moderation';globalThis.__cxStory=story;
      return {data:{id:story.id,status:'pending_moderation'},error:null};
    }
    return {data:null,error:{message:'Unexpected RPC'}};
  },
  functions:{invoke:async(name,{body}={})=>{globalThis.__cxFunctionCalls=globalThis.__cxFunctionCalls||[];globalThis.__cxFunctionCalls.push({name,body});return {data:{processed:1,sent:1,failed:0},error:null};}}
 };
}`;

async function routedPage(browser, role = 'moderator', initialStatus = 'pending_moderation') {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(({ role, initialStatus }) => { globalThis.__cxRole=role; globalThis.__cxInitialStatus=initialStatus; }, { role, initialStatus });
  await page.route('**/supabase-js@2/+esm', (route) => route.fulfill({ status: 200, contentType: 'application/javascript', body: mockSupabaseModule }));
  return page;
}

async function openModerator(page) {
  await page.goto(`${base}/moderation.html?id=${storyId}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-mod-action="request_changes"]');
  const buttons = await page.locator('[data-mod-action]').allTextContents();
  if (!buttons.some((text)=>/Request changes/i.test(text)) || !buttons.some((text)=>/Reject/i.test(text)) || !buttons.some((text)=>/Approve & Publish/i.test(text))) throw new Error('Moderator console must expose all three moderation decisions.');
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });

  const request = await routedPage(browser);
  request.on('dialog',(dialog)=>dialog.accept());
  await openModerator(request);
  await request.fill('[data-mod-contributor-message]','Please remove the individual name and make the date less specific.');
  await request.fill('[data-mod-internal]','Privacy clean-up before public archive.');
  await request.click('[data-mod-action="request_changes"]');
  await request.waitForFunction(() => Array.isArray(globalThis.__cxRpcCalls) && globalThis.__cxRpcCalls.length === 1);
  const requestState = await request.evaluate(() => ({ rpc:globalThis.__cxRpcCalls[0], functions:globalThis.__cxFunctionCalls||[] }));
  if (requestState.rpc.name !== 'moderate_experience' || requestState.rpc.params.p_action !== 'request_changes') throw new Error('Request Changes did not call the moderation RPC.');
  if (!/remove the individual name/i.test(requestState.rpc.params.p_contributor_message || '')) throw new Error('Contributor-facing change request was lost.');
  if (requestState.functions[0]?.name !== 'process-story-notifications') throw new Error('Request Changes did not kick the notification worker.');
  await request.close();

  const revision = await routedPage(browser,'contributor','changes_requested');
  await revision.goto(`${base}/submission-changes.html?id=${storyId}`, { waitUntil:'domcontentloaded' });
  await revision.waitForSelector('[data-resubmit]');
  const note = await revision.locator('.cx-change-note').textContent();
  if (!/timing less specific/i.test(note || '')) throw new Error('Contributor revision page did not show the HRTechify change note.');
  const fields = revision.locator('[data-revision-answer]');
  if (await fields.count() < 2) throw new Error('Contributor revision page did not restore Story Beats.');
  await fields.first().fill('I joined for growth and learning, without naming individual colleagues.');
  await revision.click('[data-resubmit]');
  await revision.waitForFunction(() => Array.isArray(globalThis.__cxRpcCalls) && globalThis.__cxRpcCalls.length === 1);
  const revisionState = await revision.evaluate(() => ({ rpc:globalThis.__cxRpcCalls[0], functions:globalThis.__cxFunctionCalls||[] }));
  if (revisionState.rpc.name !== 'resubmit_experience') throw new Error('Contributor revision did not use the resubmission RPC.');
  if (!revisionState.rpc.params.p_answers.some((answer)=>/without naming/i.test(answer.answer || ''))) throw new Error('Edited Story Beat was not included in resubmission.');
  if (revisionState.functions[0]?.name !== 'process-story-notifications') throw new Error('Resubmission did not notify HRTechify.');
  await revision.close();

  const publish = await routedPage(browser);
  publish.on('dialog',(dialog)=>dialog.accept());
  await openModerator(publish);
  await publish.click('[data-mod-action="publish"]');
  await publish.waitForFunction(() => Array.isArray(globalThis.__cxRpcCalls) && globalThis.__cxRpcCalls.length === 1);
  const publishState = await publish.evaluate(() => globalThis.__cxRpcCalls[0]);
  if (publishState.name !== 'moderate_experience' || publishState.params.p_action !== 'publish' || !publishState.params.p_headline || !publishState.params.p_summary) throw new Error('Approve & Publish did not carry the public preview into the moderation RPC.');
  await publish.close();

  const reject = await routedPage(browser);
  reject.on('dialog',(dialog)=>dialog.accept());
  await openModerator(reject);
  await reject.fill('[data-mod-contributor-message]','We cannot publish this version because the account includes identifying details that cannot be safely moderated.');
  await reject.click('[data-mod-action="reject"]');
  await reject.waitForFunction(() => Array.isArray(globalThis.__cxRpcCalls) && globalThis.__cxRpcCalls.length === 1);
  const rejectState = await reject.evaluate(() => globalThis.__cxRpcCalls[0]);
  if (rejectState.name !== 'moderate_experience' || rejectState.params.p_action !== 'reject' || !/identifying details/i.test(rejectState.params.p_contributor_message || '')) throw new Error('Reject did not preserve the contributor-facing explanation.');
  await reject.close();

  console.log('Moderation-flow smoke passed: request changes, contributor resubmission, publish and reject are connected to the private workflow.');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
