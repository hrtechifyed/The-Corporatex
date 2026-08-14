import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile('supabase/migrations/202608140005_secure_story_notification_trigger.sql','utf8');

test('story notification trigger can enqueue fixed internal jobs without granting client queue writes',()=>{
  assert.match(migration,/create or replace function public\.enqueue_story_notifications\(\)/i);
  assert.match(migration,/security definer/i);
  assert.match(migration,/set search_path=public/i);
  assert.match(migration,/insert into public\.story_notification_jobs\(experience_id,kind\)/i);
  assert.match(migration,/revoke all on function public\.enqueue_story_notifications\(\) from authenticated/i);
  assert.doesNotMatch(migration,/grant\s+(insert|update|delete)\s+on\s+public\.story_notification_jobs\s+to\s+(authenticated|anon)/i);
});
