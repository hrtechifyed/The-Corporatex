import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [login, moderation] = await Promise.all([
  readFile('login.html','utf8'),
  readFile('src/moderation-console.js','utf8'),
]);

test('login offers explicit User and HRTechify Admin access modes', () => {
  assert.match(login, /data-access-role="user"[^>]*>User</i);
  assert.match(login, /data-access-role="admin"[^>]*>HRTechify Admin</i);
  assert.match(login, /hasModeratorAccess/);
  assert.match(login, /data\?\.role==='moderator'/);
  assert.match(login, /data\?\.account_status==='active'/);
  assert.match(login, /Admin accounts cannot be created from this page/);
});

test('moderator redirect preselects admin access', () => {
  assert.match(moderation, /login\.html\?access=admin&next=/);
});

test('moderation selects the contributor profile through the exact foreign key', () => {
  assert.match(moderation, /contributor_profile:profiles!experiences_profile_id_fkey\(hrt_id\)/);
  assert.doesNotMatch(moderation, /,profiles\(hrt_id\)/);
});
