'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AnalysisRunner({ id, hasAnalysis }: { id: string; hasAnalysis: boolean }) {
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');
  const router = useRouter();

  async function run() {
    setState('loading');
    setError('');
    const response = await fetch(`/api/experiences/${id}/analyse`, { method: 'POST' });
    if (!response.ok) {
      const body = await response.json();
      setState('error');
      setError(body.error || 'The safety screen could not complete.');
      return;
    }
    router.push(`/submit/${id}/review`);
    router.refresh();
  }

  return (
    <section className="cx-journey-panel">
      <p className="cx-kicker">Before the Final Cut</p>
      <h2 className="cx-title">A careful screen. No opinion score.</h2>
      <p className="cx-lede">The story stays on the CorporateX server. The screen looks for direct slurs, targeted abuse, threats, graphic violence, self-harm expressions and basic identifying details.</p>
      <div className="cx-feature-grid">
        <article className="cx-feature-card"><span>01 · PRIVATE</span><h3>Your draft stays private.</h3><p>Nothing is public at this stage.</p></article>
        <article className="cx-feature-card"><span>02 · NARROW</span><h3>Your criticism is not moderated.</h3><p>The screen is limited to safety and identity indicators.</p></article>
        <article className="cx-feature-card"><span>03 · YOURS</span><h3>You control the Final Cut.</h3><p>Edit, remove or restore every section before release.</p></article>
      </div>
      {error ? <p role="alert" className="cx-note" style={{ color: 'var(--cx-danger)', marginTop: '1rem' }}>{error} Your saved draft is unchanged.</p> : null}
      <div className="cx-actions">
        <button type="button" onClick={run} disabled={state === 'loading'} className="cx-button cx-button--signal">
          {state === 'loading' ? 'Preparing safely…' : hasAnalysis ? 'Prepare the Final Cut again' : 'Prepare the Final Cut'}
        </button>
      </div>
    </section>
  );
}
