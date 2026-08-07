import Link from 'next/link';

export default function More() {
  return (
    <div className="cx-page">
      <section className="cx-section">
        <div className="cx-shell cx-story-hero-grid">
          <div>
            <p className="cx-kicker">Why CorporateX</p>
            <h1 className="cx-display">Not a score. A <em>sequence.</em></h1>
            <p className="cx-lede">A rating gives you a reaction. A story shows what was promised, what changed and what to ask before joining.</p>
            <div className="cx-actions"><Link className="cx-button cx-button--signal" href="/browse">Explore Stories</Link><Link className="cx-button cx-button--ghost" href="/submit">Share Your Story</Link></div>
          </div>
          <div className="cx-frozen-mini-art" aria-hidden="true" />
        </div>
      </section>

      <section className="cx-section cx-light-section" id="how-it-works">
        <div className="cx-shell">
          <p className="cx-kicker">The plot</p>
          <h2 className="cx-title">Experience becomes guidance.</h2>
          <div className="cx-feature-grid">
            <article className="cx-feature-card"><span>01 · SIGNAL</span><h3>Every ending carries information.</h3><p>Relief, progress, mixed truth and recommendation can all help someone choose.</p></article>
            <article className="cx-feature-card"><span>02 · SEQUENCE</span><h3>The change matters.</h3><p>See the beginning, the promise, the good part, the shift and the lesson.</p></article>
            <article className="cx-feature-card"><span>03 · DECISION</span><h3>Use the story forward.</h3><p>Turn another person’s exit into sharper questions for your next interview.</p></article>
          </div>
        </div>
      </section>

      <section className="cx-section">
        <div className="cx-shell">
          <p className="cx-kicker">The trust model</p>
          <h2 className="cx-title">Your meaning stays yours.</h2>
          <div className="cx-feature-grid">
            <article className="cx-feature-card"><span>ONE PERSPECTIVE</span><h3>Clearly labelled.</h3><p>A contributor describes their experience—not an entire organisation.</p></article>
            <article className="cx-feature-card"><span>SAFETY ONLY</span><h3>No opinion score.</h3><p>Direct slurs, targeted abuse, threats, graphic harm and identity details are screened.</p></article>
            <article className="cx-feature-card"><span>FINAL CONTROL</span><h3>The contributor edits.</h3><p>CorporateX guides the sequence but never writes or judges the person’s story.</p></article>
          </div>
        </div>
      </section>

      <section className="cx-section cx-section--compact">
        <div className="cx-shell cx-journey-panel cx-section-heading">
          <div><p className="cx-kicker">Pass it forward</p><h2 className="cx-title">The right signal can change a career decision.</h2></div>
          <Link className="cx-button cx-button--signal" href="/submit">Begin with the Signal →</Link>
        </div>
      </section>
    </div>
  );
}
