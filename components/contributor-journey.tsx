'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ENDINGS } from '@/lib/endings';
import { SCENES } from '@/lib/types';
import {
  buildInitialFinalCut,
  draftHasRequiredContext,
  hasSubstantiveStory,
  loadContributionDraft,
  saveContributionDraft,
  substantiveStoryLength,
  type ContributionDraft,
  type FinalCut,
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

const JOURNEY_LABELS = ['Opening Signal', 'Setting the Scene', 'Story Beats', 'Final Cut', 'Submit'] as const;

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function JourneyProgress({ active }: { active: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <ol className="cx-flow-progress" aria-label="Contribution journey">
      {JOURNEY_LABELS.map((label, index) => (
        <li key={label} aria-current={active === index + 1 ? 'step' : undefined} data-complete={active > index + 1 ? 'true' : 'false'}>
          <span>{index + 1}</span>{label}
        </li>
      ))}
    </ol>
  );
}

function emitFunnel(event: string) {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('corporatex:funnel', { detail: { event } }));
}

export function OpeningSignalStep() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    setSelected(loadContributionDraft().ending || null);
  }, []);

  function choose(value: (typeof ENDINGS)[number]['value']) {
    if (moving) return;
    const draft = loadContributionDraft();
    saveContributionDraft({ ...draft, ending: value, finalCut: undefined, safety: undefined });
    setSelected(value);
    setMoving(true);
    emitFunnel('ending_chosen');
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
        <p className="cx-note cx-flow-privacy-note">Your story is not uploaded yet. Until the final safety check and verification step, this draft stays in this browser.</p>
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
    if (sceneIndex === 0) emitFunnel('story_beats_started');
  }, [router, sceneIndex]);

  useEffect(() => {
    if (draft) saveContributionDraft(draft);
  }, [draft]);

  if (!draft) return <FlowLoading label="Opening your Story Beats…" />;
  const activeDraft = draft;
  const [key, title, prompt] = SCENES[sceneIndex];

  function updateAnswer(value: string) {
    setDraft({ ...activeDraft, answers: { ...activeDraft.answers, [key]: value }, finalCut: undefined, safety: undefined });
  }

  function toggleTopic(topic: ShiftTopic) {
    const active = activeDraft.shiftTopics.includes(topic);
    setDraft({
      ...activeDraft,
      shiftTopics: active ? activeDraft.shiftTopics.filter((item) => item !== topic) : [...activeDraft.shiftTopics, topic],
      technologyFollowUp: topic === 'technology-ai' && active ? '' : activeDraft.technologyFollowUp,
      finalCut: undefined,
      safety: undefined,
    });
  }

  function previous() {
    saveContributionDraft(activeDraft);
    if (sceneIndex === 0) router.push('/submit/scene');
    else router.push(`/submit/story?beat=${sceneIndex - 1}`);
  }

  function next() {
    saveContributionDraft(activeDraft);
    if (sceneIndex === SCENES.length - 1) {
      emitFunnel('final_cut_reached');
      router.push('/submit/final-cut');
    } else {
      router.push(`/submit/story?beat=${sceneIndex + 1}`);
    }
  }

  return (
    <div className="cx-flow-shell">
      <JourneyProgress active={3} />
      <section className="cx-flow-card cx-flow-card--story">
        <div className="cx-flow-beat-index"><span>Story Beat {sceneIndex + 1} of {SCENES.length}</span><span>{activeDraft.answers[key]?.trim() ? 'Answered' : 'Optional'}</span></div>
        <p className="cx-kicker">{title}</p>
        <h1 className="cx-title">{prompt}</h1>
        <label className="cx-field cx-flow-writing-field">
          <span>Your experience</span>
          <textarea autoFocus className="cx-textarea" maxLength={1800} value={activeDraft.answers[key] || ''} onChange={(event) => updateAnswer(event.target.value)} placeholder="Write only what belongs in this moment." />
          <small>{(activeDraft.answers[key] || '').length} / 1800 · Saved on this device as you move between beats</small>
        </label>

        {key === 'shift' ? (
          <div className="cx-flow-followup">
            <p className="cx-field-label">What kind of change was involved? · optional</p>
            <div className="cx-flow-topic-grid">
              {SHIFT_TOPICS.map((topic) => <button type="button" className="cx-flow-topic" aria-pressed={activeDraft.shiftTopics.includes(topic.value)} key={topic.value} onClick={() => toggleTopic(topic.value)}>{topic.label}</button>)}
            </div>
            {activeDraft.shiftTopics.includes('technology-ai') ? (
              <label className="cx-field" style={{ marginTop: '1rem' }}>
                <span>Technology / AI follow-up · optional</span>
                <textarea className="cx-textarea" maxLength={1800} value={activeDraft.technologyFollowUp} onChange={(event) => setDraft({ ...activeDraft, technologyFollowUp: event.target.value, finalCut: undefined, safety: undefined })} placeholder="Only add this if technology or AI materially changed the work, pressure, learning or expectations." />
              </label>
            ) : null}
          </div>
        ) : null}

        <div className="cx-flow-beat-dots" aria-label={`Story Beat ${sceneIndex + 1} of ${SCENES.length}`}>
          {SCENES.map(([, beatTitle], index) => <span key={beatTitle} data-active={index === sceneIndex ? 'true' : 'false'} data-complete={Boolean(activeDraft.answers[SCENES[index][0]]?.trim()) ? 'true' : 'false'} />)}
        </div>
        <div className="cx-flow-actions"><button type="button" className="cx-button cx-button--ghost" onClick={previous}>← Previous</button><button type="button" className="cx-button cx-button--signal" onClick={next}>{sceneIndex === SCENES.length - 1 ? 'Review my story →' : activeDraft.answers[key]?.trim() ? 'Next →' : 'Skip for now →'}</button></div>
      </section>
    </div>
  );
}

export function FinalCutStep() {
  const router = useRouter();
  const [draft, setDraft] = useState<ContributionDraft | null>(null);
  const [finalCut, setFinalCut] = useState<FinalCut | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const current = loadContributionDraft();
    if (!draftHasRequiredContext(current)) {
      router.replace('/submit');
      return;
    }
    setDraft(current);
    setFinalCut(current.finalCut || buildInitialFinalCut(current));
  }, [router]);

  useEffect(() => {
    if (draft && finalCut) saveContributionDraft({ ...draft, finalCut, safety: undefined });
  }, [draft, finalCut]);

  if (!draft || !finalCut) return <FlowLoading label="Preparing your Final Cut…" />;
  const activeDraft = draft;
  const activeCut = finalCut;
  const storyLength = substantiveStoryLength(activeCut.beats);

  function saveAndCheck() {
    if (activeCut.headline.trim().length < 3 || activeCut.summary.trim().length < 20) return;
    if (!hasSubstantiveStory(activeCut.beats)) {
      setError('Add at least one or two sentences of your own experience across any Story Beat before continuing. You choose which moment matters.');
      return;
    }
    setError('');
    saveContributionDraft({ ...activeDraft, finalCut: activeCut, safety: undefined });
    emitFunnel('safety_check_started');
    router.push('/submit/safety');
  }

  return (
    <div className="cx-flow-shell">
      <JourneyProgress active={4} />
      <section className="cx-flow-card">
        <p className="cx-kicker">The Final Cut · Private</p>
        <h1 className="cx-title">Read it as someone else will.</h1>
        <p className="cx-lede">Nothing is submitted yet. Edit or remove anything before the narrow safety check.</p>

        <div className="cx-flow-summary-grid">
          <div><span>Ending</span><strong>{activeDraft.ending}</strong></div>
          <div><span>Company</span><strong>{activeDraft.context.companyName}</strong></div>
          <div><span>Region</span><strong>{activeDraft.context.broadRegion}</strong></div>
          <div><span>Role / team</span><strong>{activeDraft.context.broadFunction || 'Not stated'}</strong></div>
        </div>

        <label className="cx-field" style={{ marginTop: '1.5rem' }}><span>Headline</span><input className="cx-input" maxLength={160} value={activeCut.headline} onChange={(event) => setFinalCut({ ...activeCut, headline: event.target.value })} /></label>
        <label className="cx-field" style={{ marginTop: '1rem' }}><span>Short summary</span><textarea className="cx-textarea" style={{ minHeight: '130px' }} maxLength={1200} value={activeCut.summary} onChange={(event) => setFinalCut({ ...activeCut, summary: event.target.value })} /></label>

        <div className="cx-flow-final-beats">
          {SCENES.map(([beatKey, beatTitle]) => (
            <label className="cx-field cx-flow-final-beat" key={beatKey}>
              <span>{beatTitle}</span>
              <textarea className="cx-textarea" maxLength={1800} value={activeCut.beats[beatKey] || ''} onChange={(event) => { setError(''); setFinalCut({ ...activeCut, beats: { ...activeCut.beats, [beatKey]: event.target.value } }); }} placeholder="Leave blank to remove this Story Beat from the Final Cut." />
            </label>
          ))}
          {activeDraft.shiftTopics.includes('technology-ai') ? <label className="cx-field cx-flow-final-beat"><span>Technology / AI follow-up · optional</span><textarea className="cx-textarea" maxLength={1800} value={activeCut.technologyFollowUp} onChange={(event) => setFinalCut({ ...activeCut, technologyFollowUp: event.target.value })} /></label> : null}
        </div>
        <p className="cx-note">Story substance: {Math.min(storyLength, 60)} / 60 characters across any Story Beat. No specific beat is mandatory.</p>
        {error ? <p className="cx-flow-error" role="alert">{error}</p> : null}
        <div className="cx-flow-actions"><button type="button" className="cx-button cx-button--ghost" onClick={() => router.push(`/submit/story?beat=${SCENES.length - 1}`)}>← Back to Story Beats</button><button type="button" className="cx-button cx-button--signal" onClick={saveAndCheck} disabled={activeCut.headline.trim().length < 3 || activeCut.summary.trim().length < 20}>Run safety check →</button></div>
      </section>
    </div>
  );
}

function FlowLoading({ label }: { label: string }) {
  return <div className="cx-flow-shell"><section className="cx-flow-card cx-flow-card--center" role="status"><span className="cx-flow-spinner" aria-hidden="true" /><p>{label}</p></section></div>;
}
