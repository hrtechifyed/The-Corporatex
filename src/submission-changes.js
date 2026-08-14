import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { GUIDED_CHAPTERS } from './story-workflow-model.js';

const supabase = createClient('https://otgnnkaawwwwqxlzrfpx.supabase.co','sb_publishable_bYYz3uHOE9py4E84KpEpiw_A4HGdcoX');
const workspace = document.querySelector('[data-revision-workspace]');
const status = document.querySelector('[data-revision-status]');
const experienceId = new URLSearchParams(location.search).get('id');
const chapterMap = new Map(GUIDED_CHAPTERS.map((chapter)=>[chapter.id,chapter]));
const labelRules = [
  ['Leadership',/\b(?:manager|management|leader|leadership|boss)\b/i],['Workload',/\b(?:workload|overtime|burnout|long hours|deadline)\b/i],['Growth',/\b(?:promotion|growth|career|learning|development)\b/i],['Compensation',/\b(?:pay|salary|compensation|bonus|benefits)\b/i],['Wellbeing',/\b(?:wellbeing|well-being|stress|mental health|burnout)\b/i],['Culture',/\b(?:culture|team|colleague|collaboration)\b/i],['Change',/\b(?:restructure|reorganisation|reorganization|layoff|merger|change)\b/i],['AI',/\b(?:AI|automation|artificial intelligence|machine learning)\b/i]
];

const esc = (value) => String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
const companyName = (row) => Array.isArray(row?.companies) ? row.companies[0]?.display_name : row?.companies?.display_name;
function setStatus(message,state=''){ status.textContent=message; status.dataset.state=state; }

async function resubmit() {
  const button = workspace.querySelector('[data-resubmit]');
  const fields = [...workspace.querySelectorAll('[data-revision-answer]')];
  const answers = fields.map((field,index)=>({ question_key:field.dataset.revisionAnswer, answer:field.value.trim(), sort_order:index+1 })).filter((item)=>item.answer);
  if (!answers.length) { setStatus('Keep at least one Story Beat before resubmitting.','error'); return; }
  const combined = answers.map((item)=>item.answer).join(' ');
  const risky = [];
  if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(combined)) risky.push('an email address');
  if (/(?:\+?\d[\d\s().-]{7,}\d)/.test(combined)) risky.push('a phone number');
  if (/\b(?:https?:\/\/|www\.)\S+/i.test(combined)) risky.push('a web address');
  if (risky.length) { setStatus(`Remove ${risky.join(', ')} before resubmitting.`, 'error'); return; }
  const labels = labelRules.filter(([,pattern])=>pattern.test(combined)).map(([label])=>label).slice(0,12);
  button.disabled = true;
  setStatus('Returning your updated story to private moderation…');
  const { data, error } = await supabase.rpc('resubmit_experience',{ p_experience_id:experienceId, p_answers:answers, p_labels:labels });
  if (error) { button.disabled=false; setStatus(error.message,'error'); return; }
  supabase.functions.invoke('process-story-notifications',{ body:{ source:'contributor-resubmission', experienceId } }).catch(()=>{});
  setStatus('Resubmitted. Your updated story is back in moderation and HRTechify has been notified.','success');
  button.textContent = 'Resubmitted ✓';
  window.setTimeout(()=>location.replace(`account.html?tab=submissions&id=${encodeURIComponent(data?.id || experienceId)}`),3200);
}

async function initialise() {
  if (!experienceId) { setStatus('The story reference is missing. Open the change request from My Space.','error'); return; }
  const { data:{ session }, error:sessionError } = await supabase.auth.getSession();
  if (sessionError) { setStatus(sessionError.message,'error'); return; }
  if (!session) { location.replace(`login.html?next=${encodeURIComponent(`submission-changes.html?id=${experienceId}`)}`); return; }
  const [storyRes,answersRes,updatesRes] = await Promise.all([
    supabase.from('experiences').select('id,status,approved_headline,broad_function,broad_region,companies(display_name)').eq('id',experienceId).single(),
    supabase.from('guided_answers').select('question_key,answer,sort_order').eq('experience_id',experienceId).order('sort_order',{ascending:true}),
    supabase.from('contributor_moderation_updates').select('action,contributor_message,created_at').eq('experience_id',experienceId).order('created_at',{ascending:false}).limit(1).maybeSingle()
  ]);
  if (storyRes.error || !storyRes.data) { setStatus('This submission could not be found in your account.','error'); return; }
  const story = storyRes.data;
  if (story.status !== 'changes_requested') {
    const state = String(story.status || '').replaceAll('_',' ');
    setStatus(`This story is currently ${state}. No contributor changes are pending.`,'success');
    workspace.innerHTML = '<div class="cx-revision-actions"><a class="ref-action primary" href="account.html?tab=submissions">Return to My Space</a></div>';
    return;
  }
  const answers = answersRes.data || [];
  const update = updatesRes.data;
  const employer = companyName(story) || 'Employer';
  const note = update?.contributor_message || 'HRTechify requested a small revision before publication.';
  workspace.innerHTML = `
    <div class="cx-change-note"><strong>What HRTechify asked you to change</strong><p>${esc(note)}</p></div>
    <div class="cx-revision-context"><span>${esc(employer)}</span><span>${esc(story.broad_function || 'Team not supplied')}</span><span>${esc(story.broad_region || 'Location not supplied')}</span></div>
    <div class="cx-revision-answers">${answers.map((answer,index)=>{const chapter=chapterMap.get(answer.question_key);return `<div class="cx-revision-answer"><label for="revision-${index}">${esc(chapter?.title || String(answer.question_key).replaceAll('_',' '))}</label><small>${esc(chapter?.prompt || 'Edit only what is needed, keeping the experience in your own words.')}</small><textarea id="revision-${index}" data-revision-answer="${esc(answer.question_key)}" maxlength="12000">${esc(answer.answer)}</textarea></div>`;}).join('')}</div>
    <p class="cx-moderator-note">Your story remains private while you edit it. Remove names, direct contact details and confidential records. Resubmitting returns this same story to HRTechify; it does not create a duplicate.</p>
    <div class="cx-revision-actions"><a class="ref-action ghost" href="account.html?tab=submissions">Cancel</a><button type="button" class="primary" data-resubmit>Resubmit for moderation</button></div>`;
  workspace.querySelector('[data-resubmit]')?.addEventListener('click',resubmit);
  setStatus('Make the requested update, then resubmit when ready.','success');
}

initialise().catch((error)=>setStatus(error?.message || 'The revision workspace could not start.','error'));
