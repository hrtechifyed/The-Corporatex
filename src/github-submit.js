import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://otgnnkaawwwwqxlzrfpx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_bYYz3uHOE9py4E84KpEpiw_A4HGdcoX';
const PENDING_KEY = 'corporatexPendingSubmission';
const ENDING_KEY = 'corporatexStoryEnding';
const LAST_SUBMISSION_KEY = 'corporatexLastSubmission';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function notify(message, state = '') {
  const toast = document.querySelector('.ref-toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => toast.classList.remove('show'), 5600);
  }
  let status = document.querySelector('.cx-submit-status');
  const actions = document.querySelector('.ref-review-actions');
  if (!status && actions) {
    status = document.createElement('p');
    status.className = 'cx-submit-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    actions.after(status);
  }
  if (status) {
    status.textContent = message;
    status.dataset.state = state;
  }
}

function setBusy(busy, label = '') {
  const button = document.querySelector('[data-guided-confirm]');
  if (!button) return;
  button.disabled = busy || !document.querySelector('[data-guided-agreement]')?.checked;
  if (label) button.textContent = label;
  else if (!busy) button.textContent = 'Confirm for safety review';
}

function productionPayload(submission) {
  return {
    draftId: crypto.randomUUID(),
    ending: document.querySelector('[data-guided-workflow]')?.dataset.ending || localStorage.getItem(ENDING_KEY) || null,
    context: submission.context,
    chapters: submission.chapters,
  };
}

async function sessionWithRetry(timeoutMs = 3200) {
  const deadline = Date.now() + timeoutMs;
  do {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (session) return session;
    await new Promise((resolve) => setTimeout(resolve, 220));
  } while (Date.now() < deadline);
  return null;
}

async function send(payload) {
  setBusy(true, 'Submitting…');
  notify('Submitting your story securely for private moderation…');
  const { data, error } = await supabase.functions.invoke('submit-story', { body: payload });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  localStorage.removeItem(PENDING_KEY);
  localStorage.removeItem(ENDING_KEY);
  localStorage.setItem(LAST_SUBMISSION_KEY, JSON.stringify({ id: data?.id || payload.draftId, status: data?.status || 'pending_moderation', liveLabels: data?.liveLabels || [], submittedAt: new Date().toISOString() }));
  notify('Submitted. Your story is now private in moderation and visible in My Space.', 'success');
  setBusy(true, 'Submitted ✓');
  window.setTimeout(() => location.replace(`account.html?submitted=1&id=${encodeURIComponent(data?.id || payload.draftId)}`), 850);
}

async function requireSessionAndSend(payload) {
  const session = await sessionWithRetry(600);
  if (session) return send(payload);
  localStorage.setItem(PENDING_KEY, JSON.stringify(payload));
  setBusy(true, 'Sign in to submit…');
  notify('Your story is saved in this browser. Sign in with your private access link to finish submitting it.');
  const next = 'guided-story.html?resume=submit';
  window.setTimeout(() => { location.href = `login.html?next=${encodeURIComponent(next)}`; }, 650);
}

function handleConfirmed(event) {
  const submission = event.detail;
  if (!submission?.valid || !submission?.progress?.answered) {
    notify('Answer at least one Story Beat before submitting.', 'error');
    return;
  }
  const ending = document.querySelector('[data-guided-workflow]')?.dataset.ending || localStorage.getItem(ENDING_KEY);
  if (!ending) {
    notify('Choose one of the four endings before submitting your story.', 'error');
    return;
  }
  const payload = productionPayload(submission);
  localStorage.setItem(PENDING_KEY, JSON.stringify(payload));
  queueMicrotask(() => notify('Preparing your story for secure submission…'));
  window.setTimeout(() => requireSessionAndSend(payload).catch((error) => {
    setBusy(false);
    notify(error?.message ? `We could not submit your story: ${error.message}` : 'We could not submit your story. Your draft is still saved in this browser.', 'error');
  }), 80);
}

document.addEventListener('guidedstoryconfirmed', handleConfirmed);

document.body.dataset.cxSubmitReady = 'true';

const prototypeNote = [...document.querySelectorAll('.ref-safety-scope p')].find((p) => /Prototype note:/i.test(p.textContent || ''));
if (prototypeNote) prototypeNote.textContent = 'After confirmation, CorporateX verifies your private account and sends the story to moderation. A safe theme label may appear in the live signal cloud, but your story is not public until moderator approval.';

const heldNote = document.querySelector('.ref-field-meta span:first-child');
if (heldNote) heldNote.textContent = 'Kept in this browser until you submit.';

if (new URLSearchParams(location.search).get('resume') === 'submit') {
  const pending = localStorage.getItem(PENDING_KEY);
  if (pending) {
    setBusy(true, 'Resuming…');
    notify('Finishing your saved CorporateX submission…');
    try {
      const payload = JSON.parse(pending);
      const session = await sessionWithRetry(5000);
      if (session) await send(payload);
      else {
        setBusy(false);
        notify('Your access link did not complete sign-in yet. Open the newest CorporateX email link and try again.', 'error');
      }
    } catch (error) {
      setBusy(false);
      notify(error?.message || 'Your saved submission could not be resumed.', 'error');
    }
  } else {
    notify('There is no saved story waiting to submit on this browser.', 'error');
  }
}
