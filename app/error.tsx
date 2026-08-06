'use client';

import { CareerJarvis } from '@/components/career-jarvis';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="cx-page">
      <section className="cx-system-shell">
        <CareerJarvis compact pose="protecting" dialogue="That step did not complete. Your saved draft has not been deleted." />
        <p className="cx-kicker">Scene interrupted</p>
        <h1 className="cx-title">The signal path broke.</h1>
        <p className="cx-lede">Check the connection and try the scene again.</p>
        <div className="cx-actions"><button className="cx-button cx-button--signal" type="button" onClick={reset}>Try again</button></div>
      </section>
    </div>
  );
}
