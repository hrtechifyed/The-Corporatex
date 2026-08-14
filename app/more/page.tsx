import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'See how CorporateX turns one workplace experience into a sequence of useful signals without reducing it to a score.',
  alternates: { canonical: '/more' },
};

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
          <h2 className="cx-title">Experience becomes guidance.</h2>
          <div className="cx-feature-grid cx-feature-grid--illustrated">
            <article className="cx-feature-card cx-feature-card--illustrated">
              <div className="cx-feature-card__art" data-scene="signal" role="img" aria-label="A workplace ending at sunset, representing the signal carried by one experience." />
              <div className="cx-feature-card__body"><h3>Every ending carries information.</h3><p>Relief, progress, mixed truth and recommendation can all help someone choose.</p></div>
            </article>
            <article className="cx-feature-card cx-feature-card--illustrated">
              <div className="cx-feature-card__art" data-scene="sequence" role="img" aria-label="A reflective workplace scene representing the sequence of moments that shaped the experience." />
              <div className="cx-feature-card__body"><h3>The change matters.</h3><p>See the beginning, the promise, the good part, the shift and the lesson.</p></div>
            </article>
            <article className="cx-feature-card cx-feature-card--illustrated">
              <div className="cx-feature-card__art" data-scene="decision" role="img" aria-label="A professional looking toward a new city horizon, representing using a story in the next decision." />
              <div className="cx-feature-card__body"><h3>Use the story forward.</h3><p>Turn another person’s exit into sharper questions for your next interview.</p></div>
            </article>
          </div>
        </div>
      </section>

      <section className="cx-section">
        <div className="cx-shell">
          <p className="cx-kicker">The trust model</p>
          <h2 className="cx-title">Your meaning stays yours.</h2>
          <div className="cx-feature-grid cx-feature-grid--trust">
            <article className="cx-feature-card"><h3>Clearly labelled.</h3><p>A contributor describes their experience—not an entire organisation.</p></article>
            <article className="cx-feature-card"><h3>No opinion score.</h3><p>The automated screen checks basic contact details, direct slurs, targeted abuse and a narrow set of threat or self-harm expressions. Human moderation remains the final publication review.</p></article>
            <article className="cx-feature-card"><h3>The contributor edits.</h3><p>CorporateX guides the sequence but never writes or judges the person’s story.</p></article>
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
