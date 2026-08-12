'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { draftHasRequiredContext, hasSubstantiveStory, loadContributionDraft, saveContributionDraft, type SafetyResult } from '@/lib/contribution-draft';

function Progress() {
  const labels = ['Opening Signal', 'Setting the Scene', 'Story Beats', 'Final Cut', 'Submit'];
  return <ol className="cx-flow-progress" aria-label="Contribution journey">{labels.map((label, index) => <li key={label} aria-current={index === 4 ? 'step' : undefined} data-complete={index < 4 ? 'true' : 'false'}><span>{index + 1}</span>{label}</li>)}</ol>;
}

export function SafetyStep() {
  const router = useRouter();
  const ran = useRef(false);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [result, setResult] = useState<SafetyResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const draft = loadContributionDraft();
    if (!draft.finalCut || !draftHasRequiredContext(draft)) {
      router.replace('/submit/final-cut');
      return;
    }
    if (!hasSubstantiveStory(draft.finalCut.beats)) {
      setError('Add at least one or two sentences of your own experience across any Story Beat before running the final safety check.');
      setState('error');
      return;
    }

    void (async () => {
      try {
        const response = await fetch('/api/submission/safety', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(draft) });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || 'The safety check could not complete.');
        const safety: SafetyResult = { ...body, checkedAt: Date.now() };
        saveContributionDraft({ ...draft, safety });
        setResult(safety);
        setState('ready');
        window.dispatchEvent(new CustomEvent('corporatex:funnel', { detail: { event: safety.possibleIdentifyingDetails.length || safety.possibleAbusiveContent.length ? 'safety_blocked' : 'safety_passed' } }));
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'The safety check could not complete.');
        setState('error');
      }
    })();
  }, [router]);

  const flags = useMemo(() => result ? [...result.possibleIdentifyingDetails, ...result.possibleAbusiveContent] : [], [result]);

  return (
    <div className="cx-flow-shell">
      <Progress />
      <section className="cx-flow-card">
        <p className="cx-kicker">Safety Check</p>
        <h1 className="cx-title">A narrow screen. No opinion score.</h1>
        <p className="cx-lede">The automated screen checks basic contact-detail indicators (email addresses, phone numbers and web links), a narrow list of direct slurs or targeted abusive terms, and a narrow set of threat, violent or self-harm expressions. It does not detect every identifying clue and does not replace human moderation. Employer criticism, praise and uncomfortable opinions are not sentiment-scored.</p>
        {state === 'loading' ? <div className="cx-flow-status"><span className="cx-flow-spinner" aria-hidden="true" /><strong>Checking the Final Cut…</strong><p>The text is processed on the CorporateX server for this check. A recoverable private submission handoff is created only when you request the verification email.</p></div> : null}
        {state === 'error' ? <div className="cx-flow-status cx-flow-status--error" role="alert"><strong>Safety check paused.</strong><p>{error}</p><div className="cx-actions"><button type="button" className="cx-button cx-button--ghost" onClick={() => router.push('/submit/final-cut')}>Review Final Cut</button><button type="button" className="cx-button cx-button--ghost" onClick={() => window.location.reload()}>Try again</button></div></div> : null}
        {state === 'ready' && result && flags.length === 0 ? <div className="cx-flow-status cx-flow-status--success"><strong>Your story is ready to verify.</strong><p>No email-address, phone-number, web-link or targeted-abuse indicators were found by this narrow automated screen. The contribution will still receive human publication review.</p>{result.suggestedLabels.length ? <p className="cx-note">Signals detected from your own wording: {result.suggestedLabels.join(' · ')}</p> : null}</div> : null}
        {state === 'ready' && flags.length > 0 ? <div className="cx-flow-status cx-flow-status--warning" role="alert"><strong>Please review the Final Cut before submission.</strong><p>The screen found:</p><ul>{flags.map((flag) => <li key={flag}>{flag}</li>)}</ul><p className="cx-note">This is a safety prompt, not a judgment of your employer opinion.</p></div> : null}
        <div className="cx-flow-actions"><button type="button" className="cx-button cx-button--ghost" onClick={() => router.push('/submit/final-cut')}>← Edit Final Cut</button><button data-cx-event="verification_gate_reached" type="button" className="cx-button cx-button--signal" disabled={state !== 'ready' || flags.length > 0} onClick={() => router.push('/submit/verify')}>Verify &amp; submit →</button></div>
      </section>
    </div>
  );
}
