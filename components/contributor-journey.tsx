'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ENDINGS } from '@/lib/endings';
import { SCENES } from '@/lib/types';
import {
  buildInitialFinalCut,
  clearContributionDraft,
  draftHasRequiredContext,
  loadContributionDraft,
  saveContributionDraft,
  type ContributionContext,
  type ContributionDraft,
  type FinalCut,
  type SafetyResult,
  type ShiftTopic,
} from '@/lib/contribution-draft';

const SHIFT_TOPICS: Array<{ value: ShiftTopic; label: string }> = [
  { value: 'leadership', label: 'Leadership' },
  { value: 'team', label: 'Team' },
  { value: 'workload', label: 'Workload' },
  { value: 'structure', label: 'Structure' },
  { value: 'compensation', label: 'Compensation' },
  { value: 'technology-ai', label: 'Technology / AI' },
  { value: 'expectations', label: 'Expectations' },
  { value: 'other', label: 'Something else' },
];

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function JourneyProgress({ active }: { active: 1 | 2 | 3 | 4 | 5 }) {
  const labels = ['Opening Signal', 'Set the Scene', 'Story Beats', 'Final Cut', 'Submit'];
  return (
    <ol className="cx-flow-progress" aria-label="Contribution journey">
      {labels.map((label, index) => (
        <li key={label} aria-current={active === index + 1 ? 'step' : undefined} data-complete={active > index + 1 ? 'true' : 'false'}>
          <span>{index + 1}</span>{label}
        </li>
      ))}
    </ol>
  );
}

export function OpeningSignalStep() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    const draft = loadContributionDraft();
    setSelected(draft.ending || null);
  }, []);

  function choose(value: (typeof ENDINGS)[number]['value']) {
    if (moving) return;
    const draft = loadContributionDraft();
    saveContributionDraft({
      ...draft,
      ending: value,
      finalCut: undefined,
      safety: undefined,
    });
    setSelected(value);
    setMoving(true);
    window.setTimeout(() => router.push('/submit/scene'), prefersReducedMotion() ? 0 : 280);
  }

  return (
    <div className="cx-flow-shell">
      <JourneyProgress active={1} />
      <section className="cx-flow-card cx-flow-card--opening">
        <p className="cx-kicker">Opening Signal</p>
        <h1 className="cx-title">How did this ending feel?</h1>
        <p className="cx-lede">There is no correct choice. Pick the one closest to your experience.</p>
        <div className="cx-ending-choice-grid cx-ending-choice-grid--flow" role="radiogroup" aria-label="Choose your ending">
          {ENDINGS.map((ending) => {
            const isSelected = selected === ending.value;
            return (
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                className="cx-ending-choice cx-ending-choice--button"
                data-ending={ending.slug}
                data-selected={isSelected ? 'true' : 'false'}
                key={ending.value}
                onClick={() => choose(ending.value)}
                disabled={moving}
              >
                <span className="cx-ending-choice__card">
                  <span className="cx-ending-choice__status" aria-hidden="true">{isSelected ? 'Selected' : 'Choose'}</span>
                  <strong>{ending.title}</strong>
                  <span>{ending.description}</span>
                  <small>{ending.guidance}</small>
                </span>
              </button>
            );
          })}
        </div>
        <div className="cx-flow-signal" data-moving={moving ? 'true' : 'false'} aria-hidden="true"><span /></div>
        <p className="cx-note cx-flow-privacy-note">Your story is not uploaded yet. Until final verification, this draft stays in this browser.</p>
      </section>
    </div>
  );
}

export function SceneStep() {
  const router = useRouter();
  const [context, setContext] = useState<ContributionContext | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const draft = loadContributionDraft();
    if (!draft.ending) {
      router.replace('/submit');
      return;
    }
    setContext(draft.context);
  }, [router]);

  if (!context) return <FlowLoading label="Opening the first scene…" />;

  function change<K extends keyof ContributionContext>(key: K, value: ContributionContext[K]) {
    setContext((current) => current ? { ...current, [key]: value } : current);
  }

  function next() {
    if (context.companyName.trim().length < 2 || context.broadRegion.trim().length < 2) {
      setError('Add the company and a broad location before continuing.');
      return;
    }
    const draft = loadContributionDraft();
    saveContributionDraft({ ...draft, context, finalCut: undefined, safety: undefined });
    router.push('/submit/story?beat=0');
  }

  return (
    <div className="cx-flow-shell">
      <JourneyProgress active={2} />
      <section className="cx-flow-card">
        <p className="cx-kicker">Scene 01 · Set the Scene</p>
        <h1 className="cx-title">Where did this story unfold?</h1>
        <p className="cx-lede">Give readers the setting, not anyone’s identity. Names of colleagues and confidential records should stay out.</p>
        <div className="cx-form-grid cx-flow-form">
          <label className="cx-field"><span>Company · required</span><input className="cx-input" value={context.companyName} onChange={(e) => change('companyName', e.target.value)} maxLength={120} autoComplete="organization" /></label>
          <label className="cx-field"><span>Location · required</span><input className="cx-input" value={context.broadRegion} onChange={(e) => change('broadRegion', e.target.value)} maxLength={80} placeholder="e.g. Bengaluru, India or Remote — Europe" /></label>
          <label className="cx-field"><span>Team or function · optional</span><input className="cx-input" value={context.broadFunction} onChange={(e) => change('broadFunction', e.target.value)} maxLength={80} /></label>
          <label className="cx-field"><span>Approximate tenure</span><select className="cx-select" value={context.approximateTenure} onChange={(e) => change('approximateTenure', e.target.value)}><option>Less than 1 year</option><option>1–2 years</option><option>3–5 years</option><option>6–10 years</option><option>More than 10 years</option></select></label>
          <label className="cx-field"><span>Work arrangement</span><select className="cx-select" value={context.workArrangement} onChange={(e) => change('workArrangement', e.target.value)}><option>On-site</option><option>Hybrid</option><option>Remote</option></select></label>
        </div>
        {error ? <p className="cx-flow-error" role="alert">{error}</p> : null}
        <div className="cx-flow-actions"><button type="button" className="cx-button cx-button--ghost" onClick={() => router.push('/submit')}>← Back</button><button type="button" className="cx-button cx-button--signal" onClick={next}>Next →</button></div>
      </section>
    </div>
  );
}

export function StoryStep() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawIndex = Number(searchParams.get('beat') || '0');
  const sceneIndex = Number.isInteger(rawIndex) ? Math.max(0, Math.min(SCENES.length - 1, rawIndex)) : 0;
  const [draft, setDraft] = useState<ContributionDraft | null>(null);

  useEffect(() => {
    const current = loadContributionDraft();
    if (!draftHasRequiredContext(current)) {
      router.replace(current.ending ? '/submit/scene' : '/submit');
      return;
    }
    setDraft(current);
  }, [router]);

  const [key, title, prompt] = SCENES[sceneIndex];
  if (!draft) return <FlowLoading label="Opening your Story Beats…" />;

  function updateAnswer(value: string) {
    setDraft({ ...draft, answers: { ...draft.answers, [key]: value }, finalCut: undefined, safety: undefined });
  }

  function toggleTopic(topic: ShiftTopic) {
    const active = draft.shiftTopics.includes(topic);
    setDraft({
      ...draft,
      shiftTopics: active ? draft.shiftTopics.filter((item) => item !== topic) : [...draft.shiftTopics, topic],
      technologyFollowUp: topic === 'technology-ai' && active ? '' : draft.technologyFollowUp,
      finalCut: undefined,
      safety: undefined,
    });
  }

  function saveCurrent() {
    return saveContributionDraft(draft);
  }

  function previous() {
    saveCurrent();
    if (sceneIndex === 0) router.push('/submit/scene');
    else router.push(`/submit/story?beat=${sceneIndex - 1}`);
  }

  function next() {
    saveCurrent();
    if (sceneIndex === SCENES.length - 1) router.push('/submit/final-cut');
    else router.push(`/submit/story?beat=${sceneIndex + 1}`);
  }

  return (
    <div className="cx-flow-shell">
      <JourneyProgress active={3} />
      <section className="cx-flow-card cx-flow-card--story">
        <div className="cx-flow-beat-index"><span>Story Beat {sceneIndex + 1} of {SCENES.length}</span><span>{draft.answers[key]?.trim() ? 'Answered' : 'Optional'}</span></div>
        <p className="cx-kicker">{title}</p>
        <h1 className="cx-title">{prompt}</h1>
        <label className="cx-field cx-flow-writing-field">
          <span>Your experience</span>
          <textarea
            autoFocus
            className="cx-textarea"
            maxLength={1800}
            value={draft.answers[key] || ''}
            onChange={(e) => updateAnswer(e.target.value)}
            placeholder="Write only what belongs in this moment."
          />
          <small>{(draft.answers[key] || '').length} / 1800</small>
        </label>

        {key === 'shift' ? (
          <div className="cx-flow-followup">
            <p className="cx-field-label">What kind of change was involved? · optional</p>
            <div className="cx-flow-topic-grid">
              {SHIFT_TOPICS.map((topic) => (
                <button type="button" className="cx-flow-topic" aria-pressed={draft.shiftTopics.includes(topic.value)} key={topic.value} onClick={() => toggleTopic(topic.value)}>{topic.label}</button>
              ))}
            </div>
            {draft.shiftTopics.includes('technology-ai') ? (
              <label className="cx-field" style={{ marginTop: '1rem' }}>
                <span>Technology / AI follow-up · optional</span>
                <textarea className="cx-textarea" maxLength={1800} value={draft.technologyFollowUp} onChange={(e) => setDraft({ ...draft, technologyFollowUp: e.target.value, finalCut: undefined, safety: undefined })} placeholder="Only add this if technology or AI materially changed the work, pressure, learning or expectations." />
              </label>
            ) : null}
          </div>
        ) : null}

        <div className="cx-flow-beat-dots" aria-label={`Story Beat ${sceneIndex + 1} of ${SCENES.length}`}>
          {SCENES.map(([, beatTitle], index) => <span key={beatTitle} data-active={index === sceneIndex ? 'true' : 'false'} data-complete={Boolean(draft.answers[SCENES[index][0]]?.trim()) ? 'true' : 'false'} />)}
        </div>
        <div className="cx-flow-actions"><button type="button" className="cx-button cx-button--ghost" onClick={previous}>← Previous</button><button type="button" className="cx-button cx-button--signal" onClick={next}>{sceneIndex === SCENES.length - 1 ? 'Review my story →' : draft.answers[key]?.trim() ? 'Next →' : 'Skip for now →'}</button></div>
      </section>
    </div>
  );
}

export function FinalCutStep() {
  const router = useRouter();
  const [draft, setDraft] = useState<ContributionDraft | null>(null);
  const [finalCut, setFinalCut] = useState<FinalCut | null>(null);

  useEffect(() => {
    const current = loadContributionDraft();
    if (!draftHasRequiredContext(current)) {
      router.replace('/submit');
      return;
    }
    const cut = current.finalCut || buildInitialFinalCut(current);
    setDraft(current);
    setFinalCut(cut);
  }, [router]);

  if (!draft || !finalCut) return <FlowLoading label="Preparing your Final Cut…" />;

  function saveAndCheck() {
    if (finalCut.headline.trim().length < 3 || finalCut.summary.trim().length < 20) return;
    saveContributionDraft({ ...draft, finalCut, safety: undefined });
    router.push('/submit/safety');
  }

  return (
    <div className="cx-flow-shell">
      <JourneyProgress active={4} />
      <section className="cx-flow-card">
        <p className="cx-kicker">The Final Cut · Private</p>
        <h1 className="cx-title">Read it as someone else will.</h1>
        <p className="cx-lede">Nothing is submitted yet. Edit or remove anything before the safety check.</p>

        <div className="cx-flow-summary-grid">
          <div><span>Ending</span><strong>{draft.ending}</strong></div>
          <div><span>Company</span><strong>{draft.context.companyName}</strong></div>
          <div><span>Region</span><strong>{draft.context.broadRegion}</strong></div>
          <div><span>Role / team</span><strong>{draft.context.broadFunction || 'Not stated'}</strong></div>
        </div>

        <label className="cx-field" style={{ marginTop: '1.5rem' }}><span>Headline</span><input className="cx-input" maxLength={160} value={finalCut.headline} onChange={(e) => setFinalCut({ ...finalCut, headline: e.target.value })} /></label>
        <label className="cx-field" style={{ marginTop: '1rem' }}><span>Short summary</span><textarea className="cx-textarea" style={{ minHeight: '130px' }} maxLength={1200} value={finalCut.summary} onChange={(e) => setFinalCut({ ...finalCut, summary: e.target.value })} /></label>

        <div className="cx-flow-final-beats">
          {SCENES.map(([beatKey, beatTitle]) => (
            <label className="cx-field cx-flow-final-beat" key={beatKey}>
              <span>{beatTitle}</span>
              <textarea className="cx-textarea" maxLength={1800} value={finalCut.beats[beatKey] || ''} onChange={(e) => setFinalCut({ ...finalCut, beats: { ...finalCut.beats, [beatKey]: e.target.value } })} placeholder="Leave blank to remove this Story Beat from the Final Cut." />
            </label>
          ))}
          {draft.shiftTopics.includes('technology-ai') ? (
            <label className="cx-field cx-flow-final-beat"><span>Technology / AI follow-up · optional</span><textarea className="cx-textarea" maxLength={1800} value={finalCut.technologyFollowUp} onChange={(e) => setFinalCut({ ...finalCut, technologyFollowUp: e.target.value })} /></label>
          ) : null}
        </div>
        <div className="cx-flow-actions"><button type="button" className="cx-button cx-button--ghost" onClick={() => { saveContributionDraft({ ...draft, finalCut, safety: undefined }); router.push(`/submit/story?beat=${SCENES.length - 1}`); }}>← Back to Story Beats</button><button type="button" className="cx-button cx-button--signal" onClick={saveAndCheck} disabled={finalCut.headline.trim().length < 3 || finalCut.summary.trim().length < 20}>Run safety check →</button></div>
      </section>
    </div>
  );
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

    void (async () => {
      try {
        const response = await fetch('/api/submission/safety', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(draft),
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || 'The safety check could not complete.');
        const safety: SafetyResult = { ...body, checkedAt: Date.now() };
        saveContributionDraft({ ...draft, safety });
        setResult(safety);
        setState('ready');
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'The safety check could not complete.');
        setState('error');
      }
    })();
  }, [router]);

  const flags = useMemo(() => result ? [...result.possibleIdentifyingDetails, ...result.possibleAbusiveContent] : [], [result]);

  return (
    <div className="cx-flow-shell">
      <JourneyProgress active={5} />
      <section className="cx-flow-card">
        <p className="cx-kicker">Safety Check</p>
        <h1 className="cx-title">A narrow screen. No opinion score.</h1>
        <p className="cx-lede">CorporateX checks identifying details and a small set of harmful expressions. Employer criticism, praise and uncomfortable opinions are not scored.</p>
        {state === 'loading' ? <div className="cx-flow-status"><span className="cx-flow-spinner" aria-hidden="true" /><strong>Checking the Final Cut…</strong></div> : null}
        {state === 'error' ? <div className="cx-flow-status cx-flow-status--error" role="alert"><strong>Safety check unavailable.</strong><p>{error}</p><button type="button" className="cx-button cx-button--ghost" onClick={() => window.location.reload()}>Try again</button></div> : null}
        {state === 'ready' && result && flags.length === 0 ? (
          <div className="cx-flow-status cx-flow-status--success"><strong>Your story is ready to verify.</strong><p>No identifying-detail or targeted-abuse indicators were found. The submission will still enter the normal private review path.</p>{result.suggestedLabels.length ? <p className="cx-note">Signals detected from your own wording: {result.suggestedLabels.join(' · ')}</p> : null}</div>
        ) : null}
        {state === 'ready' && flags.length > 0 ? (
          <div className="cx-flow-status cx-flow-status--warning" role="alert"><strong>Please review the Final Cut before submission.</strong><p>The screen found:</p><ul>{flags.map((flag) => <li key={flag}>{flag}</li>)}</ul><p className="cx-note">This is a safety prompt, not a judgment of your employer opinion.</p></div>
        ) : null}
        <div className="cx-flow-actions"><button type="button" className="cx-button cx-button--ghost" onClick={() => router.push('/submit/final-cut')}>← Edit Final Cut</button><button type="button" className="cx-button cx-button--signal" disabled={state !== 'ready' || flags.length > 0} onClick={() => router.push('/submit/verify')}>Verify &amp; submit →</button></div>
      </section>
    </div>
  );
}

export function FinishSubmissionStep() {
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const draft = loadContributionDraft();
    if (!draft.finalCut || !draft.safety || draft.safety.possibleAbusiveContent.length || draft.safety.possibleIdentifyingDetails.length) {
      router.replace('/submit/safety');
      return;
    }

    void (async () => {
      try {
        const response = await fetch('/api/submission/finalize', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(draft),
        });
        const body = await response.json();
        if (response.status === 401) {
          router.replace('/submit/verify');
          return;
        }
        if (!response.ok) throw new Error(body.error || 'Your story could not be submitted.');
        clearContributionDraft();
        router.replace(`/submit/complete?id=${encodeURIComponent(body.id)}`);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Your story could not be submitted.');
      }
    })();
  }, [router]);

  return (
    <div className="cx-flow-shell">
      <JourneyProgress active={5} />
      <section className="cx-flow-card cx-flow-card--center">
        <p className="cx-kicker">Verification complete</p>
        <h1 className="cx-title">Submitting your signal safely.</h1>
        {error ? <div className="cx-flow-status cx-flow-status--error" role="alert"><strong>Submission paused.</strong><p>{error}</p><div className="cx-actions"><button type="button" className="cx-button cx-button--ghost" onClick={() => router.push('/submit/final-cut')}>Review Final Cut</button><button type="button" className="cx-button cx-button--signal" onClick={() => window.location.reload()}>Try submission again</button></div></div> : <div className="cx-flow-status"><span className="cx-flow-spinner" aria-hidden="true" /><strong>Saving your verified contribution…</strong><p>Your draft will be cleared from this browser only after the server confirms the submission.</p></div>}
      </section>
    </div>
  );
}

function FlowLoading({ label }: { label: string }) {
  return <div className="cx-flow-shell"><section className="cx-flow-card cx-flow-card--center" role="status"><span className="cx-flow-spinner" aria-hidden="true" /><p>{label}</p></section></div>;
}
