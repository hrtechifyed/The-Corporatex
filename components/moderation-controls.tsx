'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ModerationControls({ id, status, initialHeadline, initialSummary }: { id: string; status: string; initialHeadline: string; initialSummary: string }) {
  const [note, setNote] = useState('');
  const [headline, setHeadline] = useState(initialHeadline);
  const [summary, setSummary] = useState(initialSummary);
  const [message, setMessage] = useState('');
  const router = useRouter();

  async function act(action: string) {
    const response = await fetch(`/api/moderation/${id}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action, privateReason: note, headline, summary }),
    });
    const body = await response.json();
    setMessage(response.ok ? `Action recorded: ${action.replace('_', ' ')}` : body.error);
    if (response.ok) router.refresh();
  }

  return (
    <div className="cx-review-card" style={{ marginTop: '1rem' }}>
      <p className="cx-kicker">Moderator controls</p>
      <label className="cx-field" style={{ marginTop: '1rem' }}><span>Public headline</span><input className="cx-input" value={headline} onChange={(event) => setHeadline(event.target.value)} /></label>
      <label className="cx-field" style={{ marginTop: '1rem' }}><span>Public summary</span><textarea className="cx-textarea" style={{ minHeight: '130px' }} value={summary} onChange={(event) => setSummary(event.target.value)} /></label>
      <button type="button" className="cx-button cx-button--ghost" style={{ marginTop: '.8rem' }} onClick={() => act('edit')}>Save safety and clarity edits</button>
      <label className="cx-field" style={{ marginTop: '1.2rem' }}><span>Private moderation note</span><textarea value={note} onChange={(event) => setNote(event.target.value)} className="cx-textarea" style={{ minHeight: '100px' }} /></label>
      <div className="cx-actions">
        {status === 'pending_moderation' ? <>
          <button type="button" className="cx-button cx-button--signal" onClick={() => act('publish')}>Confirm publication</button>
          <button type="button" className="cx-button cx-button--ghost" onClick={() => act('request_changes')}>Request changes</button>
          <button type="button" className="cx-button cx-button--ghost" onClick={() => act('reject')}>Remove</button>
        </> : null}
        {status === 'published' ? <button type="button" className="cx-button cx-button--ghost" onClick={() => act('unpublish')}>Unpublish</button> : null}
      </div>
      <p aria-live="polite" className="cx-note">{message}</p>
    </div>
  );
}
