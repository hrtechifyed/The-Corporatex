'use client';

import { useState } from 'react';
import { CareerJarvis } from '@/components/career-jarvis';

type EndingOption = {
  value: string;
  slug: 'break-free' | 'next-act' | 'mixed-ending' | 'pass-the-torch';
  title: string;
  description: string;
  guidance: string;
};

type OpeningSignalSelectorProps = {
  endings: readonly EndingOption[];
};

export function OpeningSignalSelector({ endings }: OpeningSignalSelectorProps) {
  const [selected, setSelected] = useState<EndingOption | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);

  function continueToScene() {
    if (!selected) return;

    setIsAdvancing(true);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const target = document.getElementById('set-the-scene');

    target?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });

    window.setTimeout(() => {
      target?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true });
      setIsAdvancing(false);
    }, reduceMotion ? 0 : 420);
  }

  const dialogue = selected
    ? `${selected.title} is selected. I’ll open the path to the setting next.`
    : 'Choose the ending that feels closest. Your choice can hold both strength and nuance.';

  return (
    <section className="cx-opening-signal" aria-labelledby="opening-signal-title">
      <div className="cx-opening-signal__content">
        <fieldset>
          <legend>
            <span className="cx-kicker">Opening Signal</span>
            <span className="cx-title" id="opening-signal-title" style={{ display: 'block' }}>
              How did this ending feel?
            </span>
          </legend>
          <p className="cx-note">There is no correct choice. Pick the one closest to your experience.</p>

          <div className="cx-ending-choice-grid">
            {endings.map((ending) => {
              const isSelected = selected?.value === ending.value;

              return (
                <label
                  className="cx-ending-choice"
                  data-ending={ending.slug}
                  data-selected={isSelected ? 'true' : 'false'}
                  key={ending.value}
                >
                  <input
                    type="radio"
                    name="mainReason"
                    value={ending.value}
                    required
                    checked={isSelected}
                    onChange={() => setSelected(ending)}
                  />
                  <span className="cx-ending-choice__card">
                    <span className="cx-ending-choice__status" aria-hidden="true">
                      {isSelected ? 'Selected' : 'Choose'}
                    </span>
                    <strong>{ending.title}</strong>
                    <span>{ending.description}</span>
                    <small>{ending.guidance}</small>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div
          className="cx-opening-signal__confirmation"
          data-visible={selected ? 'true' : 'false'}
          aria-live="polite"
        >
          <div>
            <span className="cx-kicker">Choice confirmed</span>
            <strong>{selected ? selected.title : 'Select an ending to continue'}</strong>
            <p>{selected ? selected.description : 'CareerJarvis will react and guide you to the next step.'}</p>
          </div>
          <button
            className="cx-button cx-button--signal"
            type="button"
            disabled={!selected || isAdvancing}
            onClick={continueToScene}
          >
            {isAdvancing ? 'Opening the scene…' : 'Continue to Set the Scene'}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <CareerJarvis
        compact
        className="cx-opening-signal__jarvis"
        pose={selected ? 'pointing' : 'inviting'}
        tone={selected?.slug ?? 'signal'}
        dialogue={dialogue}
      />
    </section>
  );
}
