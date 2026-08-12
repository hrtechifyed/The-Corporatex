'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearContributionDraft, loadContributionDraft } from '@/lib/contribution-draft';

export function ContributionDraftStatus() {
  const router = useRouter();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    const refresh = () => setSavedAt(loadContributionDraft().updatedAt);
    refresh();
    const timer = window.setInterval(refresh, 2000);
    return () => window.clearInterval(timer);
  }, []);

  function discard() {
    if (!window.confirm('Discard this local CorporateX draft? This cannot be undone.')) return;
    clearContributionDraft();
    router.replace('/submit');
  }

  const age = savedAt ? Math.max(0, Math.round((Date.now() - savedAt) / 1000)) : 0;
  const label = age < 10 ? 'just now' : age < 60 ? `${age}s ago` : `${Math.max(1, Math.round(age / 60))}m ago`;

  return (
    <aside className="cx-flow-shell" aria-label="Draft status">
      <div className="cx-draft-assurance">
        <span><strong>Saved on this device · {label}.</strong> Local drafts expire after 7 days.</span>
        <button type="button" className="cx-link-button" onClick={discard}>Discard this draft</button>
      </div>
    </aside>
  );
}
