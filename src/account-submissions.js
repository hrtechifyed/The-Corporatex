import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

if (document.body.dataset.refPage === 'account') {
  const supabase = createClient('https://otgnnkaawwwwqxlzrfpx.supabase.co','sb_publishable_bYYz3uHOE9py4E84KpEpiw_A4HGdcoX');
  const panel = document.querySelector('[data-space-panel="submissions"]');
  const count = document.querySelector('[data-count-submissions]');
  let painting = false;
  let refreshTimer = null;
  let deleting = false;

  const companyName = (row) => Array.isArray(row?.companies) ? row.companies[0]?.display_name : row?.companies?.display_name;
  const statusCopy = {
    pending_moderation:['In private moderation','HRTechify is reviewing this story. Nothing is public yet.'],
    changes_requested:['Changes requested','HRTechify needs a small update before the story can move forward.'],
    published:['Published','This story is now visible in the CorporateX Stories archive.'],
    rejected:['Review complete','This story was not published and remains private.'],
    draft:['Draft','This story has not been submitted for moderation yet.'],
    awaiting_ai_analysis:['Preparing review','CorporateX is preparing the story for moderation.'],
    awaiting_user_approval:['Ready for confirmation','Review the story before sending it to moderation.'],
    withdrawn:['Withdrawn','This story is no longer in moderation or public Stories.']
  };

  function toast(message, state = '') {
    let node = document.querySelector('.ref-toast');
    if (!node) {
      node = document.createElement('div');
      node.className = 'ref-toast';
      node.setAttribute('role','status');
      node.setAttribute('aria-live','polite');
      document.body.append(node);
    }
    node.textContent = message;
    node.dataset.state = state;
    node.classList.add('show');
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(()=>node.classList.remove('show'), 10000);
  }

  function ensureDeleteDialog() {
    let dialog = document.querySelector('[data-delete-story-dialog]');
    if (dialog) return dialog;
    dialog = document.createElement('dialog');
    dialog.className = 'cx-delete-dialog';
    dialog.dataset.deleteStoryDialog = '';
    dialog.innerHTML = `
      <form method="dialog" class="cx-delete-dialog__card" data-delete-story-form>
        <p class="cx-delete-dialog__kicker">PERMANENT STORY DELETION</p>
        <h2>Permanently delete this story?</h2>
        <p class="cx-delete-dialog__warning"><strong>Deleted data can’t be retrieved.</strong> This story and its associated story data will also be permanently deleted from the CorporateX database.</p>
        <p>If the story is published, it will disappear from the Stories page and the homepage as soon as deletion succeeds. Your CorporateX account will remain active.</p>
        <label class="cx-delete-dialog__confirm"><input type="checkbox" data-delete-story-understand /> <span>I understand this deletion cannot be undone.</span></label>
        <p class="cx-delete-dialog__status" data-delete-story-status role="status" aria-live="polite"></p>
        <div class="cx-delete-dialog__actions">
          <button type="button" class="cx-auth-button" data-delete-story-cancel>Keep my story</button>
          <button type="button" class="cx-auth-button cx-delete-story-confirm" data-delete-story-confirm disabled>Permanently delete story</button>
        </div>
      </form>`;
    document.body.append(dialog);
    const understand = dialog.querySelector('[data-delete-story-understand]');
    const confirm = dialog.querySelector('[data-delete-story-confirm]');
    const cancel = dialog.querySelector('[data-delete-story-cancel]');
    understand?.addEventListener('change',()=>{ if (confirm) confirm.disabled = !understand.checked || deleting; });
    cancel?.addEventListener('click',()=>{ if (!deleting) dialog.close(); });
    dialog.addEventListener('cancel',(event)=>{ if (deleting) event.preventDefault(); });
    confirm?.addEventListener('click', async()=>{
      const id = dialog.dataset.experienceId;
      if (!id || deleting || !understand?.checked) return;
      deleting = true;
      confirm.disabled = true;
      if (cancel) cancel.disabled = true;
      const status = dialog.querySelector('[data-delete-story-status]');
      if (status) status.textContent = 'Deleting this story permanently from CorporateX…';
      const { error } = await supabase.rpc('delete_owned_story_and_queue_receipt',{ p_experience_id:id });
      if (error) {
        deleting = false;
        if (cancel) cancel.disabled = false;
        confirm.disabled = !understand.checked;
        if (status) status.textContent = 'CorporateX could not delete this story. Nothing was removed. Please try again.';
        return;
      }
      deleting = false;
      dialog.close();
      toast('Story permanently deleted. A CorporateX confirmation email is being sent to you.', 'success');
      await render();
    });
    return dialog;
  }

  function openDeleteDialog(story) {
    const dialog = ensureDeleteDialog();
    dialog.dataset.experienceId = story.id;
    const understand = dialog.querySelector('[data-delete-story-understand]');
    const confirm = dialog.querySelector('[data-delete-story-confirm]');
    const cancel = dialog.querySelector('[data-delete-story-cancel]');
    const status = dialog.querySelector('[data-delete-story-status]');
    if (understand) understand.checked = false;
    if (confirm) confirm.disabled = true;
    if (cancel) cancel.disabled = false;
    if (status) status.textContent = '';
    dialog.showModal();
  }

  async function render() {
    if (!panel || painting) return;
    const { data:{ session } } = await supabase.auth.getSession();
    if (!session) return;
    const [storiesRes,updatesRes] = await Promise.all([
      supabase.from('experiences').select('id,status,approved_headline,broad_region,broad_function,created_at,updated_at,public_slug,companies(display_name)').order('updated_at',{ascending:false}),
      supabase.from('contributor_moderation_updates').select('experience_id,action,contributor_message,created_at').order('created_at',{ascending:false})
    ]);
    if (storiesRes.error) return;
    const stories = storiesRes.data || [];
    const latestUpdate = new Map();
    for (const update of updatesRes.data || []) if (!latestUpdate.has(update.experience_id)) latestUpdate.set(update.experience_id,update);
    painting = true;
    if (count) count.textContent = String(stories.length);
    if (!stories.length) {
      panel.innerHTML = '<div class="cx-account-state"><span class="cx-account-state__mark">✦</span><div><h2>No submissions yet.</h2><p>When you share a workplace story, its private status will appear here.</p></div></div>';
    } else {
      panel.replaceChildren(...stories.map((story)=>{
        const card = document.createElement('article');
        card.className = 'cx-account-story';
        card.dataset.submissionId = story.id;
        const [label,description] = statusCopy[story.status] || [String(story.status).replaceAll('_',' '),'Your submission is being processed.'];
        const company = companyName(story) || 'Workplace story';
        const update = latestUpdate.get(story.id);
        const heading = document.createElement('h2');
        heading.textContent = story.approved_headline || company;
        const context = document.createElement('p');
        context.textContent = [company,story.broad_function,story.broad_region].filter(Boolean).join(' · ');
        const meta = document.createElement('div');
        meta.className = 'cx-account-story__meta';
        const state = document.createElement('span'); state.textContent = label;
        const date = document.createElement('span'); date.textContent = `Updated ${new Date(story.updated_at || story.created_at).toLocaleDateString()}`;
        meta.append(state,date);
        const info = document.createElement('p');
        info.className = 'cx-submission-explainer';
        info.textContent = description;
        card.append(heading,context,meta,info);

        const actions = document.createElement('div');
        actions.className = 'cx-submission-actions';
        if (story.status === 'changes_requested') {
          if (update?.contributor_message) {
            const note = document.createElement('p');
            note.className = 'cx-submission-note';
            note.textContent = `HRTechify: ${update.contributor_message}`;
            card.append(note);
          }
          const link = document.createElement('a');
          link.className = 'cx-auth-button cx-auth-button--primary';
          link.href = `submission-changes.html?id=${encodeURIComponent(story.id)}`;
          link.textContent = 'Review requested changes →';
          actions.append(link);
        } else if (story.status === 'published') {
          const link = document.createElement('a');
          link.className = 'cx-auth-button cx-auth-button--primary';
          link.href = `story-detail.html?id=${encodeURIComponent(story.id)}`;
          link.textContent = 'View published story →';
          actions.append(link);
        }
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'cx-auth-button cx-delete-story';
        remove.textContent = 'Delete my story';
        remove.addEventListener('click',()=>openDeleteDialog(story));
        actions.append(remove);
        card.append(actions);
        return card;
      }));
    }
    painting = false;
  }

  const observer = panel ? new MutationObserver(()=>{
    if (painting) return;
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(render,180);
  }) : null;
  observer?.observe(panel,{childList:true,subtree:true});
  window.setTimeout(()=>{ observer?.disconnect(); },5000);
  window.setTimeout(render,250);

  const params = new URLSearchParams(location.search);
  if (params.get('tab') === 'submissions' || params.get('submitted') === '1') {
    document.querySelector('[data-space-tab="submissions"]')?.click();
  }
}
