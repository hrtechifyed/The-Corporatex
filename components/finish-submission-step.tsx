'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { clearContributionDraft, loadContributionDraft } from '@/lib/contribution-draft';

function Progress() {
  const labels = ['Opening Signal', 'Setting the Scene', 'Story Beats', 'Final Cut', 'Submit'];
  return <ol className="cx-flow-progress" aria-label="Contribution journey">{labels.map((label, index) => <li key={label} aria-current={index === 4 ? 'step' : undefined} data-complete={index < 4 ? 'true' : 'false'}><span>{index + 1}</span>{label}</li>)}</ol>;
}

export function FinishSubmissionStep() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handoffId = searchParams.get('id') || '';
  const started = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    void (async () => {
      try {
        const body = handoffId ? { handoffId } : loadContributionDraft();
        if (!handoffId) {
          const draft = body as ReturnType<typeof loadContributionDraft>;
          if (!draft.finalCut || !draft.safety || draft.safety.possibleAbusiveContent.length || draft.safety.possibleIdentifyingDetails.length) {
            router.replace('/submit/safety');
            return;
          }
        }

        const response = await fetch('/api/submission/finalize', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
        const result = await response.json();
        if (response.status === 401) {
          router.replace('/submit/verify');
          return;
        }
        if (!response.ok) throw new Error(result.error || 'Your story could not be submitted.');
        clearContributionDraft();
        window.dispatchEvent(new CustomEvent('corporatex:funnel', { detail: { event: 'submission_completed' } }));
        router.replace(`/submit/complete?id=${encodeURIComponent(result.id)}`);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Your story could not be submitted.');
      }
    })();
  }, [handoffId, router]);

  return (
    <div className="cx-flow-shell">
      <Progress />
      <section className="cx-flow-card cx-flow-card--center">
        <p className="cx-kicker">Verification complete</p>
        <h1 className="cx-title">Submitting your signal safely.</h1>
        {error ? <div className="cx-flow-status cx-flow-status--error" role="alert"><strong>Submission paused.</strong><p>{error}</p><div className="cx-actions"><button type="button" className="cx-button cx-button--ghost" onClick={() => router.push('/submit/final-cut')}>Review Final Cut</button><button type="button" className="cx-button cx-button--signal" onClick={() => window.location.reload()}>Try submission again</button></div></div> : <div className="cx-flow-status"><span className="cx-flow-spinner" aria-hidden="true" /><strong>Saving your verified contribution…</strong><p>The private handoff is being moved into the moderation queue. Any local draft is cleared only after the server confirms submission.</p></div>}
      </section>
    </div>
  );
}
