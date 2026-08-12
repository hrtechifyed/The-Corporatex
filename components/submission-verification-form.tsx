'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { requestSubmissionLink } from '@/app/submit/verify/actions';
import { hasSubstantiveStory, loadContributionDraft } from '@/lib/contribution-draft';

export function SubmissionVerificationForm({ sent = false, serverError = '' }: { sent?: boolean; serverError?: string }) {
  const [draftPayload, setDraftPayload] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    const draft = loadContributionDraft();
    if (!draft.finalCut || !draft.safety) {
      setLocalError('Return to Final Cut and complete the safety check before requesting verification.');
      return;
    }
    if ((draft.safety.possibleIdentifyingDetails?.length || 0) > 0 || (draft.safety.possibleAbusiveContent?.length || 0) > 0) {
      setLocalError('The safety check still has indicators to review. Return to Final Cut before verification.');
      return;
    }
    if (!hasSubstantiveStory(draft.finalCut.beats)) {
      setLocalError('Add at least one or two sentences of your own experience across any Story Beat before submitting.');
      return;
    }
    setDraftPayload(JSON.stringify(draft));
  }, []);

  return (
    <>
      {sent ? (
        <div className="cx-flow-status cx-flow-status--success" role="status">
          <strong>Check your inbox.</strong>
          <p>The verification email is sent by HRTechify · CorporateX. Your contributor-approved Final Cut has already been saved privately as a recoverable handoff, so the one-time link can be opened in another browser or device.</p>
          <p className="cx-note">The handoff is private and has not entered moderation yet. Verification is what submits it into the review path.</p>
        </div>
      ) : null}

      <form action={requestSubmissionLink} className="cx-flow-verify-form">
        <input type="hidden" name="draftPayload" value={draftPayload} />
        <label className="cx-field"><span>{sent ? 'Resend to this email or use a different email' : 'Email address'}</span><input className="cx-input" required type="email" name="email" autoComplete="email" /></label>
        <p className="cx-note">The one-time verification email will come from the HRTechify mailbox with CorporateX branding. Your email never appears on the public story.</p>
        {localError ? <p className="cx-flow-error" role="alert">{localError}</p> : null}
        {serverError ? <p className="cx-flow-error" role="alert">{serverError}</p> : null}
        <div className="cx-flow-actions">
          <Link className="cx-button cx-button--ghost" href="/submit/final-cut">← Return to my story</Link>
          <button data-cx-event="verification_email_requested" className="cx-button cx-button--signal" type="submit" disabled={!draftPayload}>{sent ? 'Send another confirmation link →' : 'Email my confirmation link →'}</button>
        </div>
      </form>
    </>
  );
}
