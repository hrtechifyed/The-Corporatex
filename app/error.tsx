'use client';

import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    const payload = JSON.stringify({ event: 'application_error', path: window.location.pathname.slice(0, 160), at: Date.now() });
    if (navigator.sendBeacon) navigator.sendBeacon('/api/telemetry', new Blob([payload], { type: 'application/json' }));
    else void fetch('/api/telemetry', { method: 'POST', headers: { 'content-type': 'application/json' }, body: payload, keepalive: true });
    console.error('CorporateX application error', { digest: error.digest || 'none' });
  }, [error.digest]);

  return (
    <div className="cx-page">
      <section className="cx-system-shell">
        <p className="cx-kicker">Scene interrupted</p>
        <h1 className="cx-title">The signal path broke.</h1>
        <p className="cx-lede">Check the connection and try the scene again. Browser-held contribution data is not cleared by this error screen.</p>
        <div className="cx-actions"><button className="cx-button cx-button--signal" type="button" onClick={reset}>Try again</button></div>
      </section>
    </div>
  );
}
