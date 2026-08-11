'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ENDINGS, type EndingValue } from '@/lib/endings';
import {
  loadContributionDraft,
  saveContributionDraft,
  type ContributionContext,
} from '@/lib/contribution-draft';

const DEFAULT_CONTEXT: ContributionContext = {
  companyName: '',
  broadRegion: '',
  broadFunction: '',
  approximateTenure: '1–2 years',
  workArrangement: 'Hybrid',
};

const ENDING_SCENE_CONTENT: Record<EndingValue, { headline: string; message: string; artLabel: string }> = {
  'Break Free': {
    headline: 'Relief can be part of the truth.',
    message: 'If leaving felt necessary, you do not need to justify that decision here. Start with the setting and we will keep the story grounded in what actually happened.',
    artLabel: 'Anime workplace scene at sunset, with a professional looking toward an open skyline and a sense of release and transition.',
  },
  'Next Act': {
    headline: 'Sometimes moving on is simply the next chapter.',
    message: 'If this felt like a natural step forward, let us capture the context behind the chapter you completed and what made it time to move on.',
    artLabel: 'Anime city scene with a professional moving through a bright business district toward a new chapter.',
  },
  'Mixed Ending': {
    headline: 'More than one thing can be true.',
    message: 'The parts that worked and the parts that did not can sit side by side. Setting the scene helps both land fairly without forcing the experience into one verdict.',
    artLabel: 'Anime workplace scene balancing a team setting with a reflective mood, expressing complexity and nuance.',
  },
  'Pass the Torch': {
    headline: 'Some chapters end with something worth passing on.',
    message: 'If you can still see who might thrive there, that perspective matters. Let us start with the workplace context that made the experience what it was.',
    artLabel: 'Anime sunset workplace scene suggesting transition, appreciation and a positive handoff to the next person.',
  },
};

function JourneyProgress() {
  const labels = ['Opening Signal', 'Setting the Scene', 'Story Beats', 'Final Cut', 'Submit'];
  return (
    <ol className="cx-flow-progress" aria-label="Contribution journey">
      {labels.map((label, index) => (
        <li key={label} aria-current={index === 1 ? 'step' : undefined} data-complete={index < 1 ? 'true' : 'false'}>
          <span>{index + 1}</span>{label}
        </li>
      ))}
    </ol>
  );
}

export function ValidatedSceneStep({ endingSlug, fromHome = false }: { endingSlug?: string; fromHome?: boolean }) {
  const router = useRouter();
  const [context, setContext] = useState<ContributionContext>(DEFAULT_CONTEXT);
  const [endingValue, setEndingValue] = useState<EndingValue | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [placeState, setPlaceState] = useState<'idle' | 'checking' | 'verified'>('idle');
  const [verifiedPlace, setVerifiedPlace] = useState('');

  useEffect(() => {
    const draft = loadContributionDraft();
    const selectedFromUrl = endingSlug ? ENDINGS.find((ending) => ending.slug === endingSlug) : undefined;
    const activeEnding = selectedFromUrl?.value || draft.ending;

    if (!activeEnding) {
      router.replace('/submit');
      return;
    }

    if (draft.ending !== activeEnding) {
      saveContributionDraft({ ...draft, ending: activeEnding, finalCut: undefined, safety: undefined });
    }

    setEndingValue(activeEnding);
    setContext(draft.context);
    setLoaded(true);
  }, [endingSlug, router]);

  useEffect(() => {
    if (!loaded) return;
    const draft = loadContributionDraft();
    saveContributionDraft({ ...draft, context, finalCut: undefined, safety: undefined });
  }, [context, loaded]);

  function change<K extends keyof ContributionContext>(key: K, value: ContributionContext[K]) {
    setContext((current) => ({ ...current, [key]: value }));
    setError('');
    if (key === 'broadRegion') {
      setPlaceState('idle');
      setVerifiedPlace('');
    }
  }

  async function next() {
    if (context.companyName.trim().length < 2 || context.broadRegion.trim().length < 2) {
      setError('Add the company and a valid city, region or country before continuing.');
      return;
    }

    setPlaceState('checking');
    setError('');

    try {
      const response = await fetch(`/api/location/validate?q=${encodeURIComponent(context.broadRegion.trim())}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      const body = await response.json();
      if (!response.ok || !body.valid) {
        setPlaceState('idle');
        setError(body.error || 'We could not verify that location. Use a real city, region or country.');
        return;
      }

      setPlaceState('verified');
      setVerifiedPlace(String(body.matchedName || context.broadRegion));
      const draft = loadContributionDraft();
      saveContributionDraft({ ...draft, context, finalCut: undefined, safety: undefined });
      router.push('/submit/story?beat=0');
    } catch {
      setPlaceState('idle');
      setError('Place verification is temporarily unavailable. Please try again.');
    }
  }

  if (!loaded || !endingValue) {
    return (
      <div className="cx-flow-shell">
        <JourneyProgress />
        <section className="cx-flow-card cx-flow-card--center" role="status">
          <p className="cx-kicker">Scene 01</p>
          <h1 className="cx-title">Setting the Scene</h1>
          <p className="cx-note">Preparing the context for your story…</p>
        </section>
      </div>
    );
  }

  const ending = ENDINGS.find((item) => item.value === endingValue) || ENDINGS[2];
  const scene = ENDING_SCENE_CONTENT[endingValue];

  return (
    <div className="cx-flow-shell">
      <JourneyProgress />
      <section className="cx-flow-card cx-scene-page" data-ending={ending.slug}>
        <div className="cx-scene-entry" data-ending={ending.slug}>
          <div className="cx-scene-entry__art" role="img" aria-label={scene.artLabel} />
          <div className="cx-scene-entry__copy">
            <span className="cx-scene-entry__choice">You chose · {ending.title}</span>
            <h2>{scene.headline}</h2>
            <p>{scene.message}</p>
          </div>
        </div>

        <div className="cx-scene-form-heading">
          <p className="cx-kicker">Scene 01</p>
          <h1 className="cx-title">Setting the Scene</h1>
          <h2>Where did this story unfold?</h2>
          <p className="cx-lede">Give readers the setting, not anyone’s identity. Names of colleagues and confidential records should stay out.</p>
        </div>

        <div className="cx-form-grid cx-flow-form">
          <label className="cx-field"><span>Company · required</span><input className="cx-input" value={context.companyName} onChange={(event) => change('companyName', event.target.value)} maxLength={120} autoComplete="organization" /></label>
          <label className="cx-field">
            <span>Location · required</span>
            <input className="cx-input" value={context.broadRegion} onChange={(event) => change('broadRegion', event.target.value)} maxLength={80} placeholder="e.g. Bengaluru, India" autoComplete="address-level2" />
            <small className="cx-location-state" data-state={placeState} aria-live="polite">
              {placeState === 'checking' ? 'Checking that this is a real place…' : placeState === 'verified' ? `Verified place: ${verifiedPlace}` : 'Use a real city, region or country. Remote work is captured separately below.'}
              <a className="cx-location-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">Place data © OpenStreetMap contributors</a>
            </small>
          </label>
          <label className="cx-field"><span>Team or function · optional</span><input className="cx-input" value={context.broadFunction} onChange={(event) => change('broadFunction', event.target.value)} maxLength={80} /></label>
          <label className="cx-field"><span>Approximate tenure</span><select className="cx-select" value={context.approximateTenure} onChange={(event) => change('approximateTenure', event.target.value)}><option>Less than 1 year</option><option>1–2 years</option><option>3–5 years</option><option>6–10 years</option><option>More than 10 years</option></select></label>
          <label className="cx-field"><span>Work arrangement</span><select className="cx-select" value={context.workArrangement} onChange={(event) => change('workArrangement', event.target.value)}><option>On-site</option><option>Hybrid</option><option>Remote</option></select></label>
        </div>
        {error ? <p className="cx-flow-error" role="alert">{error}</p> : null}
        <div className="cx-flow-actions"><button type="button" className="cx-button cx-button--ghost" onClick={() => router.push(fromHome ? '/#ending-title' : '/submit')}>← Back</button><button type="button" className="cx-button cx-button--signal" onClick={next} disabled={placeState === 'checking'}>{placeState === 'checking' ? 'Checking location…' : 'Next →'}</button></div>
      </section>

      <style>{`
        .cx-scene-page {
          --scene-accent: #f2bd48;
          --scene-glow: rgba(242,189,72,.18);
        }
        .cx-scene-page[data-ending="next-act"] { --scene-accent: #79aef6; --scene-glow: rgba(121,174,246,.18); }
        .cx-scene-page[data-ending="mixed-ending"] { --scene-accent: #a88afb; --scene-glow: rgba(168,138,251,.17); }
        .cx-scene-page[data-ending="pass-the-torch"] { --scene-accent: #67d2bd; --scene-glow: rgba(103,210,189,.17); }
        .cx-scene-entry {
          display: grid;
          grid-template-columns: minmax(260px,.86fr) minmax(0,1.14fr);
          min-height: 235px;
          margin: 0 0 2rem;
          overflow: hidden;
          border: 1px solid color-mix(in srgb, var(--scene-accent) 38%, rgba(255,255,255,.12));
          border-radius: 24px;
          background: #08090b;
          box-shadow: 0 24px 62px rgba(0,0,0,.35), 0 0 38px var(--scene-glow);
        }
        .cx-scene-entry__art {
          min-height: 235px;
          background-size: cover;
          background-position: center;
          filter: saturate(.9) contrast(1.04) brightness(.88);
          animation: cx-scene-breathe 9s ease-in-out infinite alternate;
        }
        .cx-scene-entry[data-ending="break-free"] .cx-scene-entry__art {
          background-image: linear-gradient(90deg, rgba(6,7,8,.04), rgba(6,7,8,.3)), linear-gradient(180deg, rgba(231,154,45,.08), rgba(4,5,7,.58)), url('/frozen-assets/card-1');
          background-position: center 46%;
        }
        .cx-scene-entry[data-ending="next-act"] .cx-scene-entry__art {
          background-image: linear-gradient(90deg, rgba(6,7,8,.06), rgba(6,7,8,.32)), linear-gradient(180deg, rgba(79,142,231,.06), rgba(4,5,7,.55)), url('/frozen-assets/card-2');
          background-position: center 45%;
        }
        .cx-scene-entry[data-ending="mixed-ending"] .cx-scene-entry__art {
          background-image: linear-gradient(90deg, rgba(6,7,8,.05), rgba(6,7,8,.34)), linear-gradient(180deg, rgba(144,107,223,.07), rgba(4,5,7,.58)), url('/frozen-assets/card-3');
          background-position: center 43%;
        }
        .cx-scene-entry[data-ending="pass-the-torch"] .cx-scene-entry__art {
          background-image: linear-gradient(90deg, rgba(6,7,8,.03), rgba(6,7,8,.3)), linear-gradient(180deg, rgba(74,190,155,.06), rgba(4,5,7,.53)), url('/frozen-assets/card-5');
          background-position: center 42%;
        }
        .cx-scene-entry__copy {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: clamp(1.4rem,3vw,2.45rem);
          background: radial-gradient(circle at 100% 0%, var(--scene-glow), transparent 48%), linear-gradient(135deg, #101113, #08090a 72%);
        }
        .cx-scene-entry__choice {
          align-self: flex-start;
          margin-bottom: .75rem;
          padding: .35rem .55rem;
          border: 1px solid color-mix(in srgb, var(--scene-accent) 40%, transparent);
          border-radius: 999px;
          color: var(--scene-accent);
          background: color-mix(in srgb, var(--scene-accent) 8%, transparent);
          font-size: .67rem;
          font-weight: 850;
          letter-spacing: .13em;
          text-transform: uppercase;
        }
        .cx-scene-entry__copy h2 {
          margin: 0;
          max-width: 650px;
          color: #fff8ed;
          font-size: clamp(1.55rem,2.5vw,2.35rem);
          line-height: 1.05;
          letter-spacing: -.04em;
        }
        .cx-scene-entry__copy p {
          margin: .85rem 0 0;
          max-width: 720px;
          color: #b6b1ad;
          font-size: .98rem;
          line-height: 1.65;
        }
        .cx-scene-form-heading { margin-bottom: 1.25rem; }
        .cx-scene-form-heading .cx-title { margin-bottom: .35rem; }
        .cx-scene-form-heading h2 {
          margin: .1rem 0 .45rem;
          color: #f6c84f;
          font-size: clamp(1.2rem,1.8vw,1.55rem);
          font-weight: 720;
          letter-spacing: -.02em;
        }
        @keyframes cx-scene-breathe {
          from { transform: scale(1.005); }
          to { transform: scale(1.035); }
        }
        @media (max-width: 760px) {
          .cx-scene-entry { grid-template-columns: 1fr; }
          .cx-scene-entry__art { min-height: 190px; }
          .cx-scene-entry__copy { padding: 1.25rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cx-scene-entry__art { animation: none; }
        }
      `}</style>
    </div>
  );
}
