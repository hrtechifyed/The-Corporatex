'use client';

import { useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { SCENES } from '@/lib/types';
import type { EndingSlug } from '@/lib/endings';
import { CareerJarvis } from '@/components/career-jarvis';

type Saved = { question_key: string; answer: string };

const toneGuidance: Record<EndingSlug, string> = {
  'break-free': 'You can name what made leaving necessary while still preserving any part that was genuinely good.',
  'next-act': 'A healthy ending is useful. Show what you gained and why the next chapter made sense.',
  'mixed-ending': 'Keep both truths. The good does not cancel the difficult, and the difficult does not erase the good.',
  'pass-the-torch': 'Show why you moved on and what could make this a strong fit for someone else.',
};

export function GuidedEditor({ id, saved, ending }: { id: string; saved: Saved[]; ending: EndingSlug }) {
  const router = useRouter();
  const [scene, setScene] = useState(0);
  const initial = Object.fromEntries(saved.map((item) => [item.question_key, item.answer]));
  const [answers, setAnswers] = useState<Record<string, string>>(initial);
  const [state, setState] = useState('Saved online');
  const [error, setError] = useState('');
  const [key, title, prompt] = SCENES[scene];
  const answered = SCENES.filter(([sceneKey]) => Boolean(answers[sceneKey]?.trim())).length;
  const progress = Math.round((answered / SCENES.length) * 100);

  async function save() {
    setState('Saving…');
    setError('');
    const response = await fetch(`/api/experiences/${id}/answers`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ questionKey: key, answer: answers[key] || '', sortOrder: scene }),
    });
    if (!response.ok) {
      const body = await response.json();
      setError(body.error || 'Save failed');
      setState('Not saved');
      return false;
    }
    setState('Saved online');
    return true;
  }

  async function move(next: number) {
    if (next === scene) return;
    if (await save()) setScene(Math.max(0, Math.min(SCENES.length - 1, next)));
  }

  async function continueToReview() {
    if (await save()) router.push(`/submit/${id}/analysis`);
  }

  return (
    <div className="cx-editor-layout">
      <nav className="cx-scene-rail" aria-label="Story Beats">
        {SCENES.map(([sceneKey, sceneTitle], index) => (
          <button
            type="button"
            className="cx-scene-button"
            key={sceneKey}
            onClick={() => move(index)}
            aria-current={index === scene ? 'step' : undefined}
          >
            <span>{index + 1}</span>
            <b>{sceneTitle}</b>
            <i>{answers[sceneKey]?.trim() ? '✓' : ''}</i>
          </button>
        ))}
      </nav>

      <section className="cx-editor-stage" aria-labelledby="active-beat-title">
        <div className="cx-editor-copy">
          <div className="cx-editor-index">
            <span>Story Beat {scene + 1} of {SCENES.length}</span>
            <span>{answered} answered</span>
          </div>
          <h2 id="active-beat-title">{title}</h2>
          <p className="cx-editor-prompt">{prompt}</p>
          <p className="cx-note">{toneGuidance[ending]}</p>
          <label className="cx-field" style={{ marginTop: '1.25rem' }}>
            <span>Your experience</span>
            <textarea
              className="cx-textarea"
              maxLength={1800}
              value={answers[key] || ''}
              onChange={(event) => {
                setAnswers({ ...answers, [key]: event.target.value });
                setState('Unsaved changes');
              }}
              placeholder="Write only what belongs in this moment. Names and confidential records should stay out."
            />
            <small>{(answers[key] || '').length} / 1800 · Saved privately to your CorporateX draft</small>
          </label>
          <div className="cx-progress" style={{ '--progress': `${progress}%` } as CSSProperties} aria-label={`${progress}% of Story Beats answered`}>
            <span />
          </div>
          <div className="cx-editor-controls">
            <span className="cx-save-state" data-state={state === 'Saved online' ? 'saved' : 'pending'} aria-live="polite">
              {state}{error ? ` · ${error}` : ''}
            </span>
            <button type="button" className="cx-button cx-button--ghost" onClick={() => router.push(`/submit/${id}/context`)}>Edit the Scene</button>
            <button type="button" className="cx-button cx-button--ghost" onClick={() => move(scene - 1)} disabled={scene === 0}>← Previous</button>
            <button type="button" className="cx-button cx-button--ghost" onClick={() => move(scene + 1)} disabled={scene === SCENES.length - 1}>Save &amp; next</button>
            <button type="button" className="cx-button cx-button--signal" onClick={continueToReview}>Prepare the Final Cut →</button>
          </div>
        </div>
        <CareerJarvis
          compact
          pose="listening"
          tone={ending}
          dialogue="I’ll stay quiet while you write. Choose any beat, and return whenever you need."
        />
      </section>
    </div>
  );
}
