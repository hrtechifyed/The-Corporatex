import Link from 'next/link';

export default function SubmissionComplete() {
  return (
    <div className="cx-flow-shell">
      <section className="cx-flow-card cx-flow-card--center cx-flow-card--complete">
        <div className="cx-flow-complete-mark" aria-hidden="true">✓</div>
        <p className="cx-kicker">Signal submitted</p>
        <h1 className="cx-title">Your signal has been submitted.</h1>
        <p className="cx-lede">Your story remains private while it completes the normal safety and moderation review. It is not automatically published.</p>
        <div className="cx-actions"><Link className="cx-button cx-button--ghost" href="/account">View my private archive</Link><Link className="cx-button cx-button--signal" href="/browse">Explore stories →</Link></div>
      </section>
    </div>
  );
}
