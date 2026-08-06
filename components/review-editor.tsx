'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Analysis } from '@/lib/types';

const editable: [keyof Analysis, string][] = [
  ['openingPromise', 'The Beginning'],
  ['realityCheck', 'The Promise'],
  ['positiveMoments', 'The Good Part'],
  ['firstPlotTwist', 'The Shift'],
  ['finalTrigger', 'The Tipping Point'],
  ['recurringConflict', 'The AI Turn or recurring change'],
  ['whoMayThrive', 'Who Thrives Here?'],
  ['whoMayStruggle', 'Who may find it difficult'],
  ['wouldReturn', 'Would you return?'],
];

export function ReviewEditor({ id, original, initial, ending }: { id: string; original: string; initial: Analysis; ending: string }) {
  const [analysis, setAnalysis] = useState(initial);
  const [headline, setHeadline] = useState(initial.suggestedHeadline);
  const [summary, setSummary] = useState(initial.shortSummary);
  const [labels, setLabels] = useState(initial.suggestedLabels);
  const [state, setState] = useState('Ready to review');
  const [message, setMessage] = useState('');
  const router = useRouter();

  async function save(submit = false) {
    setState(submit ? 'Releasing safely…' : 'Saving online…');
    setMessage('');
    const response = await fetch(`/api/experiences/${id}/${submit ? 'submit' : 'review'}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ analysis, headline, summary, labels }),
    });
    const body = await response.json();
    if (!response.ok) {
      setState('Not saved');
      setMessage(body.error || 'The Final Cut could not be saved.');
      return;
    }
    if (submit) {
      router.push(`/?submitted=${id}`);
      router.refresh();
      return;
    }
    setState('Saved online');
  }

  return (
    <>
      <div className="cx-review-layout">
        <section className="cx-review-card cx-review-original">
          <p className="cx-kicker">Original Story Beats</p>
          <p className="cx-note" style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }}>{original || 'Your guided responses remain preserved in the private record.'}</p>
        </section>

        <section>
          <div className="cx-review-card">
            <p className="cx-kicker">Opening Signal</p>
            <h2 style={{ marginTop: '.65rem', fontSize: '1.6rem' }}>{ending}</h2>
            <p className="cx-note">Change this from Edit the Scene before rebuilding the Final Cut.</p>
          </div>

          <div className="cx-review-card">
            <p className="cx-kicker">Public introduction</p>
            <label className="cx-field" style={{ marginTop: '1rem' }}>
              <span>Headline</span>
              <input className="cx-input" value={headline} maxLength={160} onChange={(event) => setHeadline(event.target.value)} />
            </label>
            <label className="cx-field" style={{ marginTop: '1rem' }}>
              <span>Short summary</span>
              <textarea className="cx-textarea" style={{ minHeight: '130px' }} value={summary} maxLength={1200} onChange={(event) => setSummary(event.target.value)} />
            </label>
          </div>

          {editable.map(([key, title]) => (
            <details open className="cx-review-card" key={key}>
              <summary>{title}</summary>
              <textarea
                aria-label={title}
                className="cx-textarea"
                value={String(analysis[key])}
                onChange={(event) => setAnalysis({ ...analysis, [key]: event.target.value })}
              />
              <div className="cx-actions" style={{ marginTop: '.7rem' }}>
                <button type="button" className="cx-button cx-button--ghost" onClick={() => setAnalysis({ ...analysis, [key]: '' })}>Remove this section</button>
                <button type="button" className="cx-button cx-button--quiet" onClick={() => setAnalysis({ ...analysis, [key]: initial[key] })}>Restore saved structure</button>
              </div>
            </details>
          ))}

          <div className="cx-review-card">
            <p className="cx-kicker">Public themes</p>
            <div className="cx-actions" style={{ marginTop: '1rem' }}>
              {labels.length ? labels.map((label) => (
                <button type="button" className="cx-button cx-button--ghost" key={label} onClick={() => setLabels(labels.filter((item) => item !== label))}>{label} ×</button>
              )) : <span className="cx-note">No themes suggested. The story can still be released.</span>}
            </div>
          </div>
        </section>
      </div>

      <div className="cx-review-actions">
        <span className="cx-save-state" data-state={state === 'Saved online' ? 'saved' : 'pending'} aria-live="polite">{state}{message ? ` · ${message}` : ''}</span>
        <button type="button" className="cx-button cx-button--ghost" onClick={() => router.push(`/submit/${id}/guided`)}>Back to Story Beats</button>
        <button type="button" className="cx-button cx-button--ghost" onClick={() => save()}>Save Final Cut</button>
        <button type="button" className="cx-button cx-button--signal" onClick={() => save(true)}>Release for safety review →</button>
      </div>
    </>
  );
}
