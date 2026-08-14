import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient('https://otgnnkaawwwwqxlzrfpx.supabase.co','sb_publishable_bYYz3uHOE9py4E84KpEpiw_A4HGdcoX');
const dashboard = document.querySelector('[data-mod-dashboard]');
const list = document.querySelector('[data-mod-list]');
const detail = document.querySelector('[data-mod-detail]');
const status = document.querySelector('[data-mod-status]');
const tabs = [...document.querySelectorAll('[data-mod-filter]')];
let filter = 'pending_moderation';
let queue = [];
let current = null;

const esc = (value) => String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
const shortId = (id) => String(id || '').replaceAll('-','').slice(0,8).toUpperCase();
const endingLabel = (value) => ({'break-free':'Break Free','next-act':'Next Act','mixed-ending':'Mixed Ending','pass-the-torch':'Pass the Torch'}[value] || 'Story');
const statusLabel = (value) => String(value || '').replaceAll('_',' ').replace(/\b\w/g,(m)=>m.toUpperCase());
const companyName = (row) => Array.isArray(row?.companies) ? row.companies[0]?.display_name : row?.companies?.display_name;
const contributorHrtId = (row) => Array.isArray(row?.contributor_profile) ? row.contributor_profile[0]?.hrt_id : row?.contributor_profile?.hrt_id;

function setStatus(message,state='') {
  if (!status) return;
  status.textContent = message;
  status.dataset.state = state;
}

function setFilter(next) {
  filter = next;
  tabs.forEach((button)=>button.classList.toggle('is-active',button.dataset.modFilter===next));
}

async function loadQueue({ preserveCurrent = false } = {}) {
  list.innerHTML = '<p class="cx-location-empty">Loading moderation queue…</p>';
  const { data, error } = await supabase.from('experiences')
    .select('id,status,approved_headline,approved_summary,ending_type,broad_function,broad_region,created_at,updated_at,published_at,ai_analysis,original_text,companies(display_name)')
    .eq('status',filter)
    .order('updated_at',{ ascending:false });
  if (error) {
    list.innerHTML = '<p class="cx-location-empty">The moderation queue could not be loaded.</p>';
    setStatus(error.message,'error');
    return;
  }
  queue = data || [];
  if (!queue.length) {
    list.innerHTML = `<p class="cx-location-empty">No ${esc(statusLabel(filter).toLowerCase())} stories.</p>`;
  } else {
    list.replaceChildren(...queue.map((row)=>{
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cx-mod-item';
      button.dataset.modId = row.id;
      if (current?.id === row.id) button.classList.add('is-active');
      const employer = companyName(row) || 'Employer pending';
      button.innerHTML = `<strong>${esc(employer)}</strong><span>${esc(endingLabel(row.ending_type))} · ${esc(row.broad_region || 'Location not supplied')}</span><span>${esc(shortId(row.id))} · Updated ${esc(new Date(row.updated_at || row.created_at).toLocaleDateString())}</span>`;
      button.addEventListener('click',()=>openStory(row.id));
      return button;
    }));
  }
  if (preserveCurrent && current?.id) {
    const match = queue.find((row)=>row.id===current.id);
    if (match) await openStory(match.id);
  }
}

function renderHistory(actions) {
  if (!actions.length) return '<p class="cx-moderator-note">No moderation action has been recorded yet.</p>';
  return `<div class="cx-mod-history">${actions.map((action)=>`<article><strong>${esc(String(action.action || '').replaceAll('_',' '))}</strong>${action.contributor_message ? `<p>Contributor note: ${esc(action.contributor_message)}</p>` : ''}${action.private_reason ? `<p>Internal note: ${esc(action.private_reason)}</p>` : ''}<time>${esc(new Date(action.created_at).toLocaleString())}</time></article>`).join('')}</div>`;
}

function safetyBlock(analysis) {
  const identifying = Array.isArray(analysis?.possibleIdentifyingDetails) ? analysis.possibleIdentifyingDetails : [];
  const abusive = Array.isArray(analysis?.possibleAbusiveContent) ? analysis.possibleAbusiveContent : [];
  const flags = [...identifying,...abusive];
  if (!flags.length) return '<p class="cx-moderator-note">No automated privacy/safety flags were recorded at submission.</p>';
  return `<div class="cx-mod-meta">${flags.map((flag)=>`<span>${esc(flag)}</span>`).join('')}</div>`;
}

async function openStory(id) {
  setStatus('Loading private moderation record…');
  const { data: row, error } = await supabase.from('experiences')
    .select('id,status,approved_headline,approved_summary,ending_type,broad_function,broad_region,created_at,updated_at,published_at,public_slug,ai_analysis,original_text,companies(display_name),contributor_profile:profiles!experiences_profile_id_fkey(hrt_id)')
    .eq('id',id).single();
  if (error || !row) {
    setStatus(error?.message || 'Story not found.','error');
    return;
  }
  const [answersRes,labelsRes,actionsRes] = await Promise.all([
    supabase.from('guided_answers').select('question_key,answer,sort_order').eq('experience_id',id).order('sort_order',{ ascending:true }),
    supabase.from('experience_labels').select('label').eq('experience_id',id).order('label',{ ascending:true }),
    supabase.from('moderation_actions').select('action,private_reason,contributor_message,created_at').eq('experience_id',id).order('created_at',{ ascending:false })
  ]);
  current = row;
  document.querySelectorAll('[data-mod-id]').forEach((button)=>button.classList.toggle('is-active',button.dataset.modId===id));
  const answers = answersRes.data || [];
  const labels = labelsRes.data || [];
  const actions = actionsRes.data || [];
  const employer = companyName(row) || 'Employer pending';
  const contributor = contributorHrtId(row);
  const canDecide = row.status === 'pending_moderation';
  const beats = answers.length ? answers.map((answer,index)=>`<article class="cx-mod-beat"><b>${index+1}. ${esc(String(answer.question_key || '').replaceAll('_',' '))}</b><p>${esc(answer.answer)}</p></article>`).join('') : `<article class="cx-mod-beat"><b>Submitted account</b><p>${esc(row.original_text || 'No guided Story Beat text was available.')}</p></article>`;
  const labelHtml = labels.length ? labels.map(({label})=>`<span>${esc(label)}</span>`).join('') : '<span>No theme labels</span>';
  detail.innerHTML = `
    <header class="cx-mod-detail-head"><div><p class="cx-mod-kicker">SUBMISSION ${esc(shortId(row.id))}</p><h2>${esc(employer)}</h2><span class="cx-mod-badge">${esc(statusLabel(row.status))}</span></div><div class="cx-mod-badge">${esc(contributor || 'Anonymous contributor')}</div></header>
    <div class="cx-mod-meta"><span>${esc(endingLabel(row.ending_type))}</span><span>${esc(row.broad_function || 'Team not supplied')}</span><span>${esc(row.broad_region || 'Location not supplied')}</span><span>Submitted ${esc(new Date(row.created_at).toLocaleDateString())}</span></div>
    <section class="cx-mod-section"><h3>Automated safety signals</h3>${safetyBlock(row.ai_analysis)}</section>
    <section class="cx-mod-section"><h3>Story Beats</h3><div class="cx-mod-beats">${beats}</div></section>
    <section class="cx-mod-section"><h3>Public preview</h3><label class="cx-mod-field"><span>Headline</span><input data-mod-headline maxlength="150" value="${esc(row.approved_headline || '')}" ${canDecide?'':'disabled'} /></label><label class="cx-mod-field"><span>Summary</span><textarea data-mod-summary data-long maxlength="1200" ${canDecide?'':'disabled'}>${esc(row.approved_summary || '')}</textarea></label><div class="cx-mod-meta">${labelHtml}</div></section>
    <section class="cx-mod-section"><h3>Moderation notes</h3><label class="cx-mod-field"><span>Message the contributor will see if changes are requested or the story is rejected</span><textarea data-mod-contributor-message maxlength="3000" placeholder="Be specific, respectful and actionable." ${canDecide?'':'disabled'}></textarea></label><label class="cx-mod-field"><span>Internal HRTechify note (never shown to contributor)</span><textarea data-mod-internal maxlength="3000" placeholder="Optional internal rationale." ${canDecide?'':'disabled'}></textarea></label>${canDecide?'<p class="cx-moderator-note">Request Changes and Reject require a contributor-facing explanation. Approve & Publish uses the headline and summary above and automatically sends the publication email.</p>':''}</section>
    ${canDecide?`<div class="cx-mod-actions"><button type="button" class="request" data-mod-action="request_changes">Request changes</button><button type="button" class="reject" data-mod-action="reject">Reject</button><button type="button" class="publish" data-mod-action="publish">Approve & Publish</button></div>`:''}
    <section class="cx-mod-section"><h3>Audit history</h3>${renderHistory(actions)}</section>`;
  detail.querySelectorAll('[data-mod-action]').forEach((button)=>button.addEventListener('click',()=>performAction(button.dataset.modAction)));
  setStatus(canDecide ? 'Ready for HRTechify review.' : `This story is currently ${statusLabel(row.status).toLowerCase()}.`,'success');
  history.replaceState(null,'',`moderation.html?id=${encodeURIComponent(row.id)}`);
}

async function performAction(action) {
  if (!current?.id) return;
  const contributorMessage = detail.querySelector('[data-mod-contributor-message]')?.value.trim() || '';
  const internalReason = detail.querySelector('[data-mod-internal]')?.value.trim() || '';
  const headline = detail.querySelector('[data-mod-headline]')?.value.trim() || '';
  const summary = detail.querySelector('[data-mod-summary]')?.value.trim() || '';
  if ((action === 'request_changes' || action === 'reject') && contributorMessage.length < 8) {
    setStatus('Add a clear contributor-facing explanation before continuing.','error');
    detail.querySelector('[data-mod-contributor-message]')?.focus();
    return;
  }
  if (action === 'publish' && (!headline || !summary)) {
    setStatus('Headline and public summary are required before publishing.','error');
    return;
  }
  const confirmText = action === 'publish' ? 'Publish this story to the public CorporateX archive?' : action === 'reject' ? 'Reject this story and email the contributor?' : 'Send this story back to the contributor for changes?';
  if (!window.confirm(confirmText)) return;
  const buttons = [...detail.querySelectorAll('[data-mod-action]')];
  buttons.forEach((button)=>button.disabled=true);
  setStatus(action === 'publish' ? 'Publishing story…' : action === 'reject' ? 'Recording moderation decision…' : 'Sending change request…');
  const { data, error } = await supabase.rpc('moderate_experience',{
    p_experience_id:current.id,
    p_action:action,
    p_contributor_message:contributorMessage || null,
    p_internal_reason:internalReason || null,
    p_headline:headline || null,
    p_summary:summary || null
  });
  if (error) {
    buttons.forEach((button)=>button.disabled=false);
    setStatus(error.message,'error');
    return;
  }
  supabase.functions.invoke('process-story-notifications',{ body:{ source:'moderation-console', experienceId:current.id } }).catch(()=>{});
  const resultStatus = data?.status || (action === 'publish' ? 'published' : action === 'reject' ? 'rejected' : 'changes_requested');
  setStatus(action === 'publish' ? 'Published. The contributor approval email is queued.' : action === 'reject' ? 'Rejected. The contributor update email is queued.' : 'Changes requested. The contributor has been emailed with your note.','success');
  setFilter(resultStatus);
  await loadQueue();
  await openStory(current.id);
}

async function initialise() {
  const { data:{ session }, error:sessionError } = await supabase.auth.getSession();
  if (sessionError) { setStatus(sessionError.message,'error'); return; }
  if (!session) {
    const next = `moderation.html${location.search || ''}`;
    location.replace(`login.html?access=admin&next=${encodeURIComponent(next)}`);
    return;
  }
  const { data:profile, error:profileError } = await supabase.from('profiles').select('role,account_status,hrt_id').eq('id',session.user.id).single();
  if (profileError || !profile || profile.role !== 'moderator' || profile.account_status !== 'active') {
    setStatus('This CorporateX account does not have HRTechify moderator access.','error');
    if (detail) detail.innerHTML = '<div class="cx-mod-empty"><div><p class="cx-mod-kicker">ACCESS RESTRICTED</p><h2>Moderator account required.</h2><p>Sign out and use the HRTechify moderation account.</p></div></div>';
    if (dashboard) dashboard.hidden = false;
    return;
  }
  dashboard.hidden = false;
  setStatus('Moderator access confirmed.','success');
  const requestedId = new URLSearchParams(location.search).get('id');
  if (requestedId) {
    const { data:requested } = await supabase.from('experiences').select('id,status').eq('id',requestedId).maybeSingle();
    if (requested?.status) setFilter(requested.status);
  }
  await loadQueue();
  if (requestedId) await openStory(requestedId);
}

tabs.forEach((button)=>button.addEventListener('click',async()=>{ setFilter(button.dataset.modFilter); current=null; await loadQueue(); detail.innerHTML='<div class="cx-mod-empty"><div><p class="cx-mod-kicker">MODERATION QUEUE</p><h2>Select a story to review.</h2></div></div>'; history.replaceState(null,'','moderation.html'); }));
document.querySelector('[data-mod-signout]')?.addEventListener('click',async()=>{ await supabase.auth.signOut(); location.replace('login.html?access=admin&next=moderation.html'); });
initialise().catch((error)=>setStatus(error?.message || 'Moderator workspace could not start.','error'));
