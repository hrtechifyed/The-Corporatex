import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://otgnnkaawwwwqxlzrfpx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_bYYz3uHOE9py4E84KpEpiw_A4HGdcoX';
const PENDING_KEY = 'corporatexPendingSubmission';
const ENDING_KEY = 'corporatexStoryEnding';
const LAST_SUBMISSION_KEY = 'corporatexLastSubmission';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
let accountMode = 'create';

function notify(message, state = '', duration = 9000) {
  const toast = document.querySelector('.ref-toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => toast.classList.remove('show'), duration);
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
  button.textContent = label || 'Click here to submit';
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

function syncAccountMode(panel) {
  const title = panel.querySelector('[data-cx-account-title]');
  const intro = panel.querySelector('[data-cx-account-intro]');
  const submit = panel.querySelector('[data-cx-account-submit]');
  const switcher = panel.querySelector('[data-cx-account-switch]');
  const password = panel.querySelector('input[name="password"]');
  if (submit) submit.disabled = false;
  if (accountMode === 'signin') {
    if (title) title.textContent = 'Already have CorporateX? Sign in here.';
    if (intro) intro.textContent = 'Returning contributors must use the email and password already attached to their CorporateX account. No sign-in link will be emailed.';
    if (submit) submit.textContent = 'Sign in & submit';
    if (switcher) switcher.textContent = 'First time here? Create an account';
    if (password) password.autocomplete = 'current-password';
  } else {
    if (title) title.textContent = 'Create your CorporateX account to submit.';
    if (intro) intro.textContent = 'Your email is never shown with your story. Create a password now so you can return to My Space and track moderation later.';
    if (submit) submit.textContent = 'Create account & submit';
    if (switcher) switcher.textContent = 'I already have an account';
    if (password) password.autocomplete = 'new-password';
  }
}

function accountPanel() {
  let panel = document.querySelector('[data-cx-submit-account]');
  if (panel) return panel;
  panel = document.createElement('section');
  panel.className = 'cx-submit-account';
  panel.dataset.cxSubmitAccount = '';
  panel.hidden = true;
  panel.innerHTML = `
    <div class="cx-submit-account__head">
      <div><p class="ref-editor-kicker">PRIVATE CONTRIBUTOR ACCOUNT</p><h3 data-cx-account-title>Create your CorporateX account to submit.</h3></div>
      <span>Private</span>
    </div>
    <p class="cx-submit-account__intro" data-cx-account-intro>Your email is never shown with your story. Create a password now so you can return to My Space and track moderation later.</p>
    <form data-cx-account-form>
      <label><span>Email address</span><input type="email" name="email" autocomplete="email" inputmode="email" required placeholder="you@example.com" /></label>
      <label><span>Password</span><input type="password" name="password" autocomplete="new-password" minlength="10" required placeholder="Minimum 10 characters" /><small>Use at least 10 characters. Letters, numbers and special characters are allowed.</small></label>
      <div class="cx-submit-account__actions"><button type="submit" class="ref-action primary" data-cx-account-submit>Create account & submit</button><button type="button" class="ref-action ghost" data-cx-account-switch>I already have an account</button></div>
      <p class="cx-submit-account__status" data-cx-account-status role="status" aria-live="polite"></p>
    </form>
    <div class="cx-submit-next"><strong>What happens next</strong><span>1. Your story goes into private moderation.</span><span>2. HRTechify receives a review notification.</span><span>3. You receive a CorporateX receipt by email.</span><span>4. HRTechify can publish it, request a change, or decline publication.</span><span>5. If approved, it appears in Stories and we email you again.</span></div>`;
  const review = document.querySelector('[data-guided-review-panel]');
  const actions = review?.querySelector('.ref-review-actions');
  actions?.before(panel);

  panel.querySelector('[data-cx-account-switch]')?.addEventListener('click', () => {
    accountMode = accountMode === 'create' ? 'signin' : 'create';
    const status = panel.querySelector('[data-cx-account-status]');
    if (status) status.textContent = '';
    syncAccountMode(panel);
  });
  panel.querySelector('[data-cx-account-form]')?.addEventListener('submit', handleAccountSubmit);
  return panel;
}

function showAccountPanel(payload) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(payload));
  const panel = accountPanel();
  panel.hidden = false;
  syncAccountMode(panel);
  notify('Your story is saved in this browser. Add your private email and password below to continue submission.', '', 14000);
  panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function send(payload) {
  setBusy(true, 'Submitting…');
  notify('Submitting your story securely for private moderation…', '', 9000);
  const { data, error } = await supabase.functions.invoke('submit-story', { body: payload });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  localStorage.removeItem(PENDING_KEY);
  localStorage.removeItem(ENDING_KEY);
  localStorage.setItem(LAST_SUBMISSION_KEY, JSON.stringify({ id: data?.id || payload.draftId, status: data?.status || 'pending_moderation', liveLabels: data?.liveLabels || [], submittedAt: new Date().toISOString() }));
  notify('Submitted. Your story is now private in moderation. Your CorporateX submission receipt is being prepared.', 'success', 14000);
  setBusy(true, 'Submitted ✓');
  const panel = document.querySelector('[data-cx-submit-account]');
  if (panel) panel.hidden = true;
  window.setTimeout(() => location.replace(`account.html?submitted=1&tab=submissions&id=${encodeURIComponent(data?.id || payload.draftId)}`), 5200);
}

async function handleAccountSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const panel = form.closest('[data-cx-submit-account]');
  const status = form.querySelector('[data-cx-account-status]');
  const submit = form.querySelector('[data-cx-account-submit]');
  const data = new FormData(form);
  const email = String(data.get('email') || '').trim().toLowerCase();
  const password = String(data.get('password') || '');
  if (password.length < 10) {
    status.textContent = 'Use a password with at least 10 characters.';
    return;
  }
  const pending = localStorage.getItem(PENDING_KEY);
  if (!pending) {
    status.textContent = 'Your saved story could not be found. Return to Final Cut and submit again.';
    return;
  }
  submit.disabled = true;
  status.textContent = accountMode === 'create' ? 'Creating your private CorporateX account…' : 'Signing in to CorporateX…';
  try {
    if (accountMode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error('Email or password did not match. Try again, or choose “First time here?” if you have never created a CorporateX account.');
      status.textContent = 'Signed in. Submitting your story…';
      await send(JSON.parse(pending));
      return;
    }

    const redirect = new URL('guided-story.html?resume=submit', location.href).href;
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirect, data: { product: 'CorporateX', access: 'my-space', intent: 'story-submission' } },
    });
    if (error) throw error;

    if (authData.user && Array.isArray(authData.user.identities) && authData.user.identities.length === 0) {
      accountMode = 'signin';
      syncAccountMode(panel);
      status.textContent = 'This email already has a CorporateX account. Enter the password you created earlier, then choose “Sign in & submit”.';
      submit.disabled = false;
      return;
    }
    if (authData.session) {
      status.textContent = 'Account created. Submitting your story…';
      await send(JSON.parse(pending));
      return;
    }
    status.textContent = 'Check your email to confirm your CorporateX account. Your story stays saved here and will submit automatically after confirmation.';
    notify('Almost done. Check your email to confirm your CorporateX account. This confirms ownership of the email; it is not a sign-in link.', 'success', 16000);
    submit.textContent = 'Waiting for email confirmation';
  } catch (error) {
    status.textContent = error?.message || 'CorporateX could not create or sign in to your account. Please try again.';
    submit.disabled = false;
  }
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
  sessionWithRetry(500).then((session) => {
    if (session) return send(payload);
    showAccountPanel(payload);
  }).catch((error) => notify(error?.message || 'CorporateX could not prepare your account step.', 'error'));
}

document.addEventListener('guidedstoryconfirmed', handleConfirmed);
document.body.dataset.cxSubmitReady = 'true';

const confirmButton = document.querySelector('[data-guided-confirm]');
if (confirmButton) confirmButton.textContent = 'Click here to submit';
const prototypeNote = [...document.querySelectorAll('.ref-safety-scope p')].find((p) => /Prototype note:/i.test(p.textContent || ''));
if (prototypeNote) prototypeNote.textContent = 'After you submit, your story enters private moderation. HRTechify may approve it, request a change, or decline publication. Your email stays private throughout.';
const heldNote = document.querySelector('.ref-field-meta span:first-child');
if (heldNote) heldNote.textContent = 'Kept in this browser until you submit.';

if (new URLSearchParams(location.search).get('resume') === 'submit') {
  const pending = localStorage.getItem(PENDING_KEY);
  if (pending) {
    setBusy(true, 'Finishing submission…');
    notify('Email confirmed. Finishing your saved CorporateX submission…', '', 10000);
    try {
      const payload = JSON.parse(pending);
      const session = await sessionWithRetry(7000);
      if (session) await send(payload);
      else {
        setBusy(false);
        notify('Your email confirmation completed, but CorporateX could not restore the account session. Return to Final Cut and choose “I already have an account”.', 'error', 12000);
      }
    } catch (error) {
      setBusy(false);
      notify(error?.message || 'Your saved submission could not be resumed.', 'error', 12000);
    }
  }
}
