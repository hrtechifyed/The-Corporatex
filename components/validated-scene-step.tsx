'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  loadContributionDraft,
  saveContributionDraft,
  type ContributionContext,
} from '@/lib/contribution-draft';

const DEFAULT_CONTEXT: ContributionContext = {
  companyName: '',
  broadRegion: '',
  broadFunction: '',
  approximateTenure: '1–2 years',
  workArrangement: 'Hybrid',
};

function JourneyProgress() {
  const labels = ['Opening Signal', 'Set the Scene', 'Story Beats', 'Final Cut', 'Submit'];
  return (
    <ol className="cx-flow-progress" aria-label="Contribution journey">
      {labels.map((label, index) => (
        <li key={label} aria-current={index === 1 ? 'step' : undefined} data-complete={index < 1 ? 'true' : 'false'}>
          <span>{index + 1}</span>{label}
        </li>
      ))}
    </ol>
  );
}

export function ValidatedSceneStep() {
  const router = useRouter();
  const [context, setContext] = useState<ContributionContext>(DEFAULT_CONTEXT);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [placeState, setPlaceState] = useState<'idle' | 'checking' | 'verified'>('idle');
  const [verifiedPlace, setVerifiedPlace] = useState('');

  useEffect(() => {
    const draft = loadContributionDraft();
    if (!draft.ending) {
      router.replace('/submit');
      return;
    }
    setContext(draft.context);
    setLoaded(true);
  }, [router]);

  useEffect(() => {
    if (!loaded) return;
    const draft = loadContributionDraft();
    saveContributionDraft({ ...draft, context, finalCut: undefined, safety: undefined });
  }, [context, loaded]);

  function change<K extends keyof ContributionContext>(key: K, value: ContributionContext[K]) {
    setContext((current) => ({ ...current, [key]: value }));
    setError('');
    if (key === 'broadRegion') {
      setPlaceState('idle');
      setVerifiedPlace('');
    }
  }

  async function next() {
    if (context.companyName.trim().length < 2 || context.broadRegion.trim().length < 2) {
      setError('Add the company and a valid city, region or country before continuing.');
      return;
    }

    setPlaceState('checking');
    setError('');

    try {
      const response = await fetch(`/api/location/validate?q=${encodeURIComponent(context.broadRegion.trim())}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      const body = await response.json();
      if (!response.ok || !body.valid) {
        setPlaceState('idle');
        setError(body.error || 'We could not verify that location. Use a real city, region or country.');
        return;
      }

      setPlaceState('verified');
      setVerifiedPlace(String(body.matchedName || context.broadRegion));
      const draft = loadContributionDraft();
      saveContributionDraft({ ...draft, context, finalCut: undefined, safety: undefined });
      router.push('/submit/story?beat=0');
    } catch {
      setPlaceState('idle');
      setError('Place verification is temporarily unavailable. Please try again.');
    }
  }

  if (!loaded) {
    return <div className="cx-flow-shell"><section className="cx-flow-card cx-flow-card--center" role="status"><span className="cx-flow-spinner" aria-hidden="true" /><p>Opening the first scene…</p></section></div>;
  }

  return (
    <div className="cx-flow-shell">
      <JourneyProgress />
      <section className="cx-flow-card">
        <p className="cx-kicker">Scene 01 · Set the Scene</p>
        <h1 className="cx-title">Where did this story unfold?</h1>
        <p className="cx-lede">Give readers the setting, not anyone’s identity. Names of colleagues and confidential records should stay out.</p>
        <div className="cx-form-grid cx-flow-form">
          <label className="cx-field"><span>Company · required</span><input className="cx-input" value={context.companyName} onChange={(event) => change('companyName', event.target.value)} maxLength={120} autoComplete="organization" /></label>
          <label className="cx-field">
            <span>Location · required</span>
            <input className="cx-input" value={context.broadRegion} onChange={(event) => change('broadRegion', event.target.value)} maxLength={80} placeholder="e.g. Bengaluru, India" autoComplete="address-level2" />
            <small className="cx-location-state" data-state={placeState} aria-live="polite">
              {placeState === 'checking' ? 'Checking that this is a real place…' : placeState === 'verified' ? `Verified place: ${verifiedPlace}` : 'Use a real city, region or country. Remote work is captured separately below.'}
              <a className="cx-location-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">Place data © OpenStreetMap contributors</a>
            </small>
          </label>
          <label className="cx-field"><span>Team or function · optional</span><input className="cx-input" value={context.broadFunction} onChange={(event) => change('broadFunction', event.target.value)} maxLength={80} /></label>
          <label className="cx-field"><span>Approximate tenure</span><select className="cx-select" value={context.approximateTenure} onChange={(event) => change('approximateTenure', event.target.value)}><option>Less than 1 year</option><option>1–2 years</option><option>3–5 years</option><option>6–10 years</option><option>More than 10 years</option></select></label>
          <label className="cx-field"><span>Work arrangement</span><select className="cx-select" value={context.workArrangement} onChange={(event) => change('workArrangement', event.target.value)}><option>On-site</option><option>Hybrid</option><option>Remote</option></select></label>
        </div>
        {error ? <p className="cx-flow-error" role="alert">{error}</p> : null}
        <div className="cx-flow-actions"><button type="button" className="cx-button cx-button--ghost" onClick={() => router.push('/submit')}>← Back</button><button type="button" className="cx-button cx-button--signal" onClick={next} disabled={placeState === 'checking'}>{placeState === 'checking' ? 'Checking location…' : 'Next →'}</button></div>
      </section>
    </div>
  );
}
