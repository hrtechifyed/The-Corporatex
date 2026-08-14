import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';

const port = 4176;
const base = `http://127.0.0.1:${port}`;
const server = spawn('python3',['-m','http.server',String(port),'-d','dist'],{stdio:['ignore','pipe','pipe']});
const delay = (ms)=>new Promise((resolve)=>setTimeout(resolve,ms));
async function waitForServer(){const deadline=Date.now()+30000;while(Date.now()<deadline){try{if((await fetch(base)).ok)return;}catch{}await delay(250);}throw new Error('Static deletion-flow server did not start.');}

const mockSupabaseModule = `
globalThis.__cxStories=globalThis.__cxStories||[{id:'11111111-1111-4111-8111-111111111111',status:'published',approved_headline:'A story I want removed',broad_region:'Hyderabad, Telangana, India',broad_function:'Product',created_at:'2026-08-14T06:00:00Z',updated_at:'2026-08-14T07:00:00Z',public_slug:'demo-story',companies:{display_name:'Demo Employer'}}];
globalThis.__cxRpcCalls=globalThis.__cxRpcCalls||[];
const session={user:{id:'00000000-0000-4000-8000-000000000001',email:'owner@example.com'}};
function rowsFor(table){if(table==='experiences')return globalThis.__cxStories;if(table==='contributor_moderation_updates')return[];if(table==='saved_experiences'||table==='experience_follows'||table==='published_experiences')return[];return[];}
function builder(table){let rows=rowsFor(table);return{select(){rows=rowsFor(table);return this},order(){return this},in(){return this},eq(){return this},then(resolve,reject){return Promise.resolve({data:rows,error:null}).then(resolve,reject)}};}
export function createClient(){return{auth:{getSession:async()=>({data:{session},error:null}),signOut:async()=>({error:null})},from:(table)=>builder(table),rpc:async(name,args)=>{globalThis.__cxRpcCalls.push({name,args});if(name!=='delete_owned_story_and_queue_receipt')return{data:null,error:{message:'unexpected rpc'}};const id=args?.p_experience_id;const owned=globalThis.__cxStories.some((story)=>story.id===id);if(!owned)return{data:null,error:{message:'not owned'}};globalThis.__cxStories=[];return{data:[{deletion_job_id:'22222222-2222-4222-8222-222222222222',deleted_experience_id:id}],error:null};}};}
`;

let browser;
try{
  await waitForServer();
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  await page.route('**/supabase-js@2/+esm',(route)=>route.fulfill({status:200,contentType:'application/javascript',body:mockSupabaseModule}));
  await page.goto(`${base}/account.html?tab=submissions`,{waitUntil:'domcontentloaded'});
  await page.click('[data-space-tab="submissions"]');
  await page.waitForSelector('.cx-delete-story');
  if((await page.locator('.cx-delete-story').textContent())?.trim()!=='Delete my story')throw new Error('My Space must expose Delete my story on an owned submission.');

  await page.click('.cx-delete-story');
  await page.waitForSelector('[data-delete-story-dialog][open]');
  const warning=await page.locator('.cx-delete-dialog__warning').textContent();
  if(!/Deleted data can’t be retrieved/i.test(warning||'')||!/database/i.test(warning||''))throw new Error('Deletion dialog must clearly state that database deletion is irreversible.');
  if(!(await page.locator('[data-delete-story-confirm]').isDisabled()))throw new Error('Permanent deletion must be disabled until the owner explicitly acknowledges irreversibility.');

  await page.check('[data-delete-story-understand]');
  if(await page.locator('[data-delete-story-confirm]').isDisabled())throw new Error('Acknowledgement should enable the final permanent-delete action.');
  await page.click('[data-delete-story-confirm]');
  await page.waitForFunction(()=>globalThis.__cxRpcCalls?.length===1);
  const rpc=await page.evaluate(()=>globalThis.__cxRpcCalls[0]);
  if(rpc.name!=='delete_owned_story_and_queue_receipt'||rpc.args?.p_experience_id!=='11111111-1111-4111-8111-111111111111')throw new Error('Deletion must call the ownership-scoped deletion RPC with the selected story id.');
  await page.waitForFunction(()=>document.querySelector('[data-space-panel="submissions"]')?.textContent?.includes('No submissions yet.'));
  await page.waitForFunction(()=>document.querySelector('.ref-toast')?.textContent?.includes('confirmation email'));
  console.log('Story-deletion smoke passed: signed-in owner sees irreversible warning, confirms once, calls ownership-scoped RPC, and My Space removes the story.');
}finally{
  if(browser)await browser.close();
  server.kill('SIGTERM');
}
