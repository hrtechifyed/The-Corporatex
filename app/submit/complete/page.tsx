import Link from 'next/link';

export default async function SubmissionComplete({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const q = await searchParams;
  const submittedId = /^[0-9a-f-]{36}$/i.test(q.id || '') ? q.id : '';
  const liveHref = submittedId ? `/?submitted=${encodeURIComponent(submittedId)}#live-signals` : '/#live-signals';

  return (
    <div className="cx-flow-shell">
      <section className="cx-flow-card cx-flow-card--center cx-flow-card--complete">
        <div className="cx-flow-complete-mark" aria-hidden="true">✓</div>
        <p className="cx-kicker">Signal received</p>
        <h1 className="cx-title">Your signal is live. Your story is still private.</h1>
        <p className="cx-lede">Safe theme labels from your verified contribution can now appear in the Live Signal Cloud as <strong>pending content validation</strong>. That does not mean your story is published: the story, company context and your identity remain private until moderation is complete.</p>
        <div className="cx-actions"><Link className="cx-button cx-button--ghost" href="/account">View my private archive</Link><Link className="cx-button cx-button--signal" href={liveHref}>See my signal live →</Link></div>
      </section>
    </div>
  );
}
