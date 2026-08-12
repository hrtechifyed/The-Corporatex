'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ReportControls({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [message, setMessage] = useState('');

  async function update(next: 'reviewing' | 'resolved' | 'dismissed') {
    const response = await fetch(`/api/moderation/reports/${id}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: next }) });
    const body = await response.json();
    setMessage(response.ok ? `Report marked ${next}.` : body.error || 'Report action failed.');
    if (response.ok) router.refresh();
  }

  return (
    <div className="cx-account-action-row">
      {status === 'open' ? <button type="button" className="cx-button cx-button--ghost" onClick={() => update('reviewing')}>Start review</button> : null}
      {status !== 'resolved' ? <button type="button" className="cx-button cx-button--signal" onClick={() => update('resolved')}>Resolve</button> : null}
      {status !== 'dismissed' ? <button type="button" className="cx-button cx-button--ghost" onClick={() => update('dismissed')}>Dismiss</button> : null}
      <span className="cx-note" aria-live="polite">{message}</span>
    </div>
  );
}
