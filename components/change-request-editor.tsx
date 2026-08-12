'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SCENES } from '@/lib/types';

type AnswerMap = Record<string, string>;

export function ChangeRequestEditor({ id, initialHeadline, initialSummary, initialAnswers, technologyFollowUp }: { id: string; initialHeadline: string; initialSummary: string; initialAnswers: AnswerMap; technologyFollowUp: string }) {
  const router = useRouter();
  const [headline, setHeadline] = useState(initialHeadline);
  const [summary, setSummary] = useState(initialSummary);
  const [answers, setAnswers] = useState<AnswerMap>(initialAnswers);
  const [tech, setTech] = useState(technologyFollowUp);
  const [state, setState] = useState<'idle' | 'saving' | 'done'>('idle');
  const [message, setMessage] = useState('');

  async function resubmit() {
    setState('saving');
    setMessage('');
    const response = await fetch(`/api/account/experiences/${id}/resubmit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ headline, summary, beats: answers, technologyFollowUp: tech }),
    });
    const body = await response.json();
    if (!response.ok) {
      setState('idle');
      setMessage(body.error || 'The revised story could not be resubmitted.');
      return;
    }
    setState('done');
    setMessage('Revised story returned to private review.');
    router.refresh();
  }

  const authored = Object.values(answers).map((value) => value.replace(/\s+/g, ' ').trim()).join(' ').length;
  const canSubmit = headline.trim().length >= 3 && summary.trim().length >= 20 && authored >= 60 && state !== 'saving';

  return (
    <section className="cx-flow-card" aria-labelledby="change-editor-title">
      <p className="cx-kicker">Contributor changes</p>
      <h2 id="change-editor-title" className="cx-title">Revise the Final Cut.</h2>
      <p className="cx-lede">Keep only what you stand behind. You can change any Story Beat without being forced to answer a particular topic. The revised version will run the narrow safety check again before returning to moderation.</p>
      <label className="cx-field" style={{ marginTop: '1.2rem' }}><span>Headline</span><input className="cx-input" maxLength={160} value={headline} onChange={(event) => setHeadline(event.target.value)} /></label>
      <label className="cx-field" style={{ marginTop: '1rem' }}><span>Short summary</span><textarea className="cx-textarea" maxLength={1200} style={{ minHeight: 130 }} value={summary} onChange={(event) => setSummary(event.target.value)} /></label>
      <div className="cx-flow-final-beats">
        {SCENES.map(([key, title]) => <label className="cx-field cx-flow-final-beat" key={key}><span>{title}</span><textarea className="cx-textarea" maxLength={1800} value={answers[key] || ''} onChange={(event) => setAnswers({ ...answers, [key]: event.target.value })} placeholder="Leave blank if this moment does not belong in your story." /></label>)}
        {technologyFollowUp || tech ? <label className="cx-field cx-flow-final-beat"><span>Technology / AI follow-up · optional</span><textarea className="cx-textarea" maxLength={1800} value={tech} onChange={(event) => setTech(event.target.value)} /></label> : null}
      </div>
      <p className="cx-note">Minimum story substance: {Math.min(authored, 60)} / 60 characters across any Story Beat.</p>
      {message ? <p className={state === 'done' ? 'cx-note' : 'cx-flow-error'} role="status">{message}</p> : null}
      <div className="cx-flow-actions"><button type="button" className="cx-button cx-button--ghost" onClick={() => router.push('/account')}>← My Stories</button><button type="button" className="cx-button cx-button--signal" disabled={!canSubmit} onClick={resubmit}>{state === 'saving' ? 'Checking & resubmitting…' : 'Return revised story to review →'}</button></div>
    </section>
  );
}
