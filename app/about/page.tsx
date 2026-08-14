'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import Link from 'next/link';

const aboutSteps = [
  {
    label: 'Experience',
    title: 'Start with what actually happened.',
    text: 'The promise, the good part, the shift and the decision stay in the contributor’s own words.',
    art: 'experience',
  },
  {
    label: 'Sequence',
    title: 'Context changes the meaning.',
    text: 'A single moment can mislead. The sequence shows what came before, what worked and what changed.',
    art: 'sequence',
  },
  {
    label: 'Signal',
    title: 'Patterns emerge without flattening stories.',
    text: 'Safe recurring themes can become shared signals while each individual account remains distinct and privately reviewed.',
    art: 'signal',
  },
  {
    label: 'Decision',
    title: 'Turn hindsight into a better question.',
    text: 'The goal is not a verdict on a company. It is sharper context for the next person deciding whether a role fits.',
    art: 'decision',
  },
] as const;

export default function AboutPage() {
  const [active, setActive] = useState(0);
  const pointerStart = useRef<number | null>(null);
  const total = aboutSteps.length;

  function move(direction: 1 | -1) {
    setActive((current) => (current + direction + total) % total);
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    pointerStart.current = event.clientX;
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (start === null) return;
    const distance = event.clientX - start;
    if (Math.abs(distance) < 44) return;
    move(distance < 0 ? 1 : -1);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      move(1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      move(-1);
    }
  }

  return (
    <div className="cx-about-page cx-about-page--deck">
      <section className="cx-about-stage cx-about-stage--deck" aria-labelledby="about-title">
        <div className="cx-about-copy">
          <p className="cx-kicker">About CorporateX</p>
          <h1 className="cx-about-title" id="about-title">Workplace truth has a <em>timeline.</em></h1>
          <p className="cx-about-lede">CorporateX follows the contributor’s story from experience to decision—without reducing it to a rating or forcing it into a preferred narrative.</p>
          <div className="cx-about-actions">
            <Link className="cx-button cx-button--signal" href="/browse">Explore Stories →</Link>
            <Link className="cx-button cx-button--ghost" href="/submit">Share Your Story</Link>
          </div>
          <p className="cx-about-microcopy"><span aria-hidden="true">✦</span> Four moments. One sequence. Swipe the deck.</p>
        </div>

        <div
          className="cx-about-visual cx-about-deck-visual"
          aria-label="How CorporateX turns workplace experience into useful context"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => { pointerStart.current = null; }}
        >
          <div className="cx-about-art" aria-hidden="true" />
          <div className="cx-about-thread" aria-hidden="true"><span /></div>

          <ol className="cx-about-sequence cx-about-card-deck" aria-live="polite">
            {aboutSteps.map((step, index) => {
              const depth = (index - active + total) % total;
              const isActive = depth === 0;
              return (
                <li key={step.label} data-depth={depth} data-active={isActive ? 'true' : 'false'} aria-hidden={!isActive}>
                  <article className="cx-about-deck-card">
                    <span className={`cx-about-card-art cx-about-card-art--${step.art}`} aria-hidden="true" />
                    <section className="cx-about-card-copy">
                      <h2>{step.title}</h2>
                      <p>{step.text}</p>
                    </section>
                  </article>
                </li>
              );
            })}
          </ol>

          <div className="cx-about-deck-controls" aria-label="About sequence controls">
            <button type="button" onClick={() => move(-1)} aria-label="Previous card">←</button>
            <div className="cx-about-deck-dots" aria-label={`Card ${active + 1} of ${total}`}>
              {aboutSteps.map((step, index) => (
                <button
                  type="button"
                  key={step.label}
                  aria-label={`Show ${step.label}`}
                  aria-current={index === active ? 'true' : undefined}
                  onClick={() => setActive(index)}
                />
              ))}
            </div>
            <button type="button" onClick={() => move(1)} aria-label="Next card">→</button>
          </div>
        </div>
      </section>
    </div>
  );
}
