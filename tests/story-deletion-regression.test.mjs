import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const account = await readFile('src/account-submissions.js','utf8');
const migration = await readFile('supabase/migrations/202608140007_self_service_story_deletion.sql','utf8');
const deletionWorker = await readFile('supabase/functions/process-story-deletions/index.ts','utf8');
const storyWorker = await readFile('supabase/functions/process-story-notifications/index.ts','utf8');
const confirmationTemplate = await readFile('supabase/templates/confirmation.html','utf8');

test('My Space exposes irreversible deletion only behind explicit confirmation',()=>{
  assert.match(account,/Delete my story/);
  assert.match(account,/Deleted data can’t be retrieved/);
  assert.match(account,/permanently deleted from the CorporateX database/);
  assert.match(account,/I understand this deletion cannot be undone/);
  assert.match(account,/data-delete-story-confirm disabled/);
  assert.match(account,/delete_owned_story_and_queue_receipt/);
  assert.match(account,/Story permanently deleted\. A CorporateX confirmation email is being sent/);
});

test('database deletion is atomic and ownership-scoped',()=>{
  assert.match(migration,/security definer/i);
  assert.match(migration,/v_profile_id uuid := auth\.uid\(\)/);
  assert.match(migration,/e\.profile_id = v_profile_id/);
  assert.match(migration,/insert into public\.story_deletion_email_jobs/);
  assert.match(migration,/delete from public\.experiences/);
  assert.match(migration,/alter table public\.story_deletion_email_jobs enable row level security/i);
  assert.match(migration,/revoke all on public\.story_deletion_email_jobs from public, anon, authenticated/i);
  assert.match(migration,/grant execute on function public\.delete_owned_story_and_queue_receipt\(uuid\) to authenticated/i);
});

test('deletion receipt is branded and leaves no permanent deletion-job record after delivery',()=>{
  assert.match(deletionWorker,/Your CorporateX story has been permanently deleted/);
  assert.match(deletionWorker,/HRTechify · CorporateX/);
  assert.match(deletionWorker,/CorporateX <span[^>]*>by HRTechify/);
  assert.match(deletionWorker,/Not a score\. A sequence\./);
  assert.match(deletionWorker,/story_deletion_email_jobs"\)\.delete\(\)/);
  assert.doesNotMatch(deletionWorker,/approved_headline|original_text|guided_answers|company_display_name/);
});

test('CorporateX branding is a contract for every application email subject and sender',()=>{
  const subjectLines = storyWorker.split('\n').filter((line)=>line.includes('subject ='));
  assert.ok(subjectLines.length >= 5,'expected the story worker email subjects');
  for (const line of subjectLines) assert.match(line,/CorporateX/,`unbranded subject: ${line.trim()}`);
  assert.match(storyWorker,/from: `"HRTechify · CorporateX"/);
  assert.match(deletionWorker,/from: `"HRTechify · CorporateX"/);
  assert.match(confirmationTemplate,/CorporateX/);
  assert.match(confirmationTemplate,/HRTechify/);
});
