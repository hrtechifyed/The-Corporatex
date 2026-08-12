'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AccountStoryControls({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const publicLike = status === 'published' || status === 'pending_moderation';

  async function remove() {
    const action = publicLike ? 'withdraw this story from the publication/review path' : 'permanently delete this private story record';
    if (!window.confirm(`Are you sure you want to ${action}?`)) return;
    setMessage('Working…');
    const response = await fetch(`/api/account/experiences/${id}`, { method: 'DELETE' });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error || 'The story could not be updated.');
      return;
    }
    setMessage(body.deleted ? 'Private story deleted.' : 'Story withdrawn.');
    router.refresh();
  }

  if (status === 'withdrawn') return <p className="cx-note">This story has been withdrawn. You can permanently delete the private record from the story details page.</p>;

  return (
    <div className="cx-account-action-row">
      <button type="button" className="cx-button cx-button--ghost" onClick={remove}>{publicLike ? 'Withdraw story' : 'Delete private story'}</button>
      <span className="cx-note" aria-live="polite">{message}</span>
    </div>
  );
}
