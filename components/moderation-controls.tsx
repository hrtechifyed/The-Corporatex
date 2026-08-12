'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ModerationControls({ id, status, initialHeadline, initialSummary }: { id: string; status: string; initialHeadline: string; initialSummary: string }) {
  const [note, setNote] = useState('');
  const [headline, setHeadline] = useState(initialHeadline);
  const [summary, setSummary] = useState(initialSummary);
  const [previewReviewed, setPreviewReviewed] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const publicCopyDirty = headline !== initialHeadline || summary !== initialSummary;

  async function act(action: string) {
    setMessage('');
    if (action === 'publish' && publicCopyDirty) {
      setMessage('Save the public headline/summary edits first, then review the refreshed exact public preview.');
      return;
    }
    if (action === 'publish' && !previewReviewed) {
      setMessage('Confirm that you reviewed the exact public preview before publication.');
      return;
    }
    if (['reject', 'request_changes', 'unpublish'].includes(action) && note.trim().length < 3) {
      setMessage('Add a private moderation reason before taking this action.');
      return;
    }

    const response = await fetch(`/api/moderation/${id}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action, privateReason: note, headline, summary, publicPreviewReviewed: previewReviewed }),
    });
    const body = await response.json();
    if (response.ok) {
      const notification = body.notification && body.notification !== 'skipped' ? ` · contributor email ${body.notification}` : '';
      setMessage(`Action recorded: ${action.replace('_', ' ')}${notification}`);
      setPreviewReviewed(false);
      router.refresh();
    } else {
      setMessage(body.error || 'Moderation action failed.');
    }
  }

  return (
    <div className="cx-review-card" style={{ marginTop: '1rem' }}>
      <p className="cx-kicker">Moderator controls</p>
      <label className="cx-field" style={{ marginTop: '1rem' }}><span>Public headline</span><input className="cx-input" value={headline} onChange={(event) => { setHeadline(event.target.value); setPreviewReviewed(false); }} /></label>
      <label className="cx-field" style={{ marginTop: '1rem' }}><span>Public summary</span><textarea className="cx-textarea" style={{ minHeight: '130px' }} value={summary} onChange={(event) => { setSummary(event.target.value); setPreviewReviewed(false); }} /></label>
      <button type="button" className="cx-button cx-button--ghost" style={{ marginTop: '.8rem' }} onClick={() => act('edit')} disabled={!publicCopyDirty}>Save safety and clarity edits</button>
      {publicCopyDirty ? <p className="cx-note">Public copy has unsaved changes. Save them before reviewing the exact publication preview.</p> : null}
      <label className="cx-field" style={{ marginTop: '1.2rem' }}><span>Private moderation note</span><textarea value={note} onChange={(event) => setNote(event.target.value)} className="cx-textarea" style={{ minHeight: '100px' }} /><small>Required for changes requested, removal and unpublish actions. This note is never public.</small></label>
      {status === 'pending_moderation' ? <label style={{ display: 'flex', gap: '.7rem', alignItems: 'flex-start', marginTop: '1rem', color: '#d2ccc4', lineHeight: 1.5, opacity: publicCopyDirty ? .55 : 1 }}><input type="checkbox" checked={previewReviewed} disabled={publicCopyDirty} onChange={(event) => setPreviewReviewed(event.target.checked)} /><span>I reviewed the exact “What will be published” preview above, including every public Story Beat, label and broad context.</span></label> : null}
      <div className="cx-actions">
        {status === 'pending_moderation' ? <>
          <button type="button" className="cx-button cx-button--signal" onClick={() => act('publish')} disabled={!previewReviewed || publicCopyDirty}>Confirm publication</button>
          <button type="button" className="cx-button cx-button--ghost" onClick={() => act('request_changes')}>Request changes</button>
          <button type="button" className="cx-button cx-button--ghost" onClick={() => act('reject')}>Remove</button>
        </> : null}
        {status === 'published' ? <button type="button" className="cx-button cx-button--ghost" onClick={() => act('unpublish')}>Unpublish</button> : null}
      </div>
      <p aria-live="polite" className="cx-note">{message}</p>
    </div>
  );
}
