import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://otgnnkaawwwwqxlzrfpx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_bYYz3uHOE9py4E84KpEpiw_A4HGdcoX';
const PENDING_KEY = 'corporatexPendingSubmission';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function notify(message) {
  const toast = document.querySelector('.ref-toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 5200);
  } else {
    const status = document.querySelector('[role="status"]');
    if (status) status.textContent = message;
  }
}

function productionPayload(submission) {
  return {
    draftId: crypto.randomUUID(),
    context: submission.context,
    chapters: submission.chapters,
  };
}

async function send(payload) {
  notify('Submitting your verified story securely…');
  const { data, error } = await supabase.functions.invoke('submit-story', { body: payload });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  localStorage.removeItem(PENDING_KEY);
  notify('Your story is now in private moderation. Redirecting to My Stories…');
  window.setTimeout(() => location.replace('account.html'), 900);
}

async function requireSessionAndSend(payload) {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return send(payload);

  localStorage.setItem(PENDING_KEY, JSON.stringify(payload));
  const next = 'guided-story.html?resume=submit';
  location.href = `login.html?next=${encodeURIComponent(next)}`;
}

document.addEventListener('guidedstoryconfirmed', (event) => {
  const submission = event.detail;
  if (!submission?.valid || !submission?.progress?.answered) return;
  const payload = productionPayload(submission);
  window.setTimeout(() => requireSessionAndSend(payload).catch((error) => notify(error.message || 'Submission failed.')), 50);
});

const prototypeNote = [...document.querySelectorAll('.ref-safety-scope p')].find((p) => /Prototype note:/i.test(p.textContent || ''));
if (prototypeNote) prototypeNote.textContent = 'After confirmation, CorporateX verifies your email and sends the story to private moderation. Nothing is published automatically.';

if (new URLSearchParams(location.search).get('resume') === 'submit') {
  const pending = localStorage.getItem(PENDING_KEY);
  if (pending) {
    try {
      const payload = JSON.parse(pending);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) await send(payload);
      else notify('Your sign-in link has not completed yet. Return from the email link to continue.');
    } catch (error) {
      notify(error.message || 'Your saved submission could not be resumed.');
    }
  }
}
