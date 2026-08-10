import Link from 'next/link';

const aboutSteps = [
  ['01', 'Experience', 'What happened belongs to the person who lived it.'],
  ['02', 'Sequence', 'Context makes a workplace story more useful than a score.'],
  ['03', 'Signal', 'Recurring themes become shared intelligence without flattening individual voices.'],
  ['04', 'Decision', 'The goal is a better question before someone makes their next move.'],
] as const;

export default function AboutPage() {
  return (
    <div className="cx-about-page">
      <section className="cx-about-stage" aria-labelledby="about-title">
        <div className="cx-about-copy">
          <p className="cx-kicker">About CorporateX</p>
          <h1 className="cx-about-title" id="about-title">Workplace truth has a <em>timeline.</em></h1>
          <p className="cx-about-lede">CorporateX turns contributor-described workplace experiences into context people can use—without reducing a career story to a star rating or forcing it into a preferred narrative.</p>
          <div className="cx-about-actions">
            <Link className="cx-button cx-button--signal" href="/browse">Explore Stories →</Link>
            <Link className="cx-button cx-button--ghost" href="/submit">Share Your Story</Link>
          </div>
        </div>

        <div className="cx-about-visual" aria-label="A glowing sequence connects experience, context, signal and decision">
          <div className="cx-about-art" aria-hidden="true" />
          <div className="cx-about-thread" aria-hidden="true"><span /></div>
          <ol className="cx-about-sequence">
            {aboutSteps.map(([number, label, text], index) => (
              <li key={label} style={{ '--about-index': index } as React.CSSProperties}>
                <span className="cx-about-node" aria-hidden="true">{number}</span>
                <div><strong>{label}</strong><p>{text}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
