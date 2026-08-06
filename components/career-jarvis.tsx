type CareerJarvisPose =
  | 'arriving'
  | 'inviting'
  | 'listening'
  | 'pointing'
  | 'protecting'
  | 'releasing'
  | 'acknowledging'
  | 'walking'
  | 'idle';

type CareerJarvisTone = 'signal' | 'break-free' | 'next-act' | 'mixed-ending' | 'pass-the-torch';

type CareerJarvisProps = {
  pose?: CareerJarvisPose;
  tone?: CareerJarvisTone;
  dialogue?: string;
  eyebrow?: string;
  compact?: boolean;
  className?: string;
};

export function CareerJarvis({
  pose = 'idle',
  tone = 'signal',
  dialogue,
  eyebrow = 'CAREERJARVIS',
  compact = false,
  className = '',
}: CareerJarvisProps) {
  return (
    <aside
      className={`career-jarvis ${compact ? 'career-jarvis--compact' : ''} ${className}`.trim()}
      data-pose={pose}
      data-tone={tone}
      aria-label={dialogue ? `CareerJarvis says: ${dialogue}` : 'CareerJarvis guide'}
    >
      <div className="career-jarvis__stage" aria-hidden="true">
        <span className="career-jarvis__halo" />
        <span className="career-jarvis__orbit career-jarvis__orbit--one" />
        <span className="career-jarvis__orbit career-jarvis__orbit--two" />

        <svg className="career-jarvis__figure" viewBox="0 0 360 520" focusable="false">
          <defs>
            <linearGradient id="career-jarvis-suit" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#20283a" />
              <stop offset="0.48" stopColor="#101622" />
              <stop offset="1" stopColor="#080b12" />
            </linearGradient>
            <linearGradient id="career-jarvis-armor" x1="0" y1="0" x2="0.9" y2="1">
              <stop offset="0" stopColor="#fff2c8" />
              <stop offset="0.32" stopColor="#e7b661" />
              <stop offset="1" stopColor="#a9562d" />
            </linearGradient>
            <linearGradient id="career-jarvis-skin" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#d49a74" />
              <stop offset="1" stopColor="#8b513e" />
            </linearGradient>
            <radialGradient id="career-jarvis-core">
              <stop offset="0" stopColor="#fffde6" />
              <stop offset="0.3" stopColor="#ffe17d" />
              <stop offset="0.72" stopColor="#ef8b3f" />
              <stop offset="1" stopColor="#d84d2b" />
            </radialGradient>
            <filter id="career-jarvis-static-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>

          <ellipse className="career-jarvis__shadow" cx="180" cy="478" rx="92" ry="18" />

          <g className="career-jarvis__rig">
            <g className="career-jarvis__leg-group career-jarvis__leg-group--left">
              <path className="career-jarvis__leg" d="M145 298 128 407l-12 54h40l16-55 9-108Z" />
              <path className="career-jarvis__leg-panel" d="m142 319-8 76 23 2 12-77Z" />
              <path className="career-jarvis__boot" d="M117 447h42l12 23c-14 8-43 8-61 0Z" />
            </g>
            <g className="career-jarvis__leg-group career-jarvis__leg-group--right">
              <path className="career-jarvis__leg" d="m188 298 8 108 15 55h40l-12-54-18-109Z" />
              <path className="career-jarvis__leg-panel" d="m193 320 11 77 23-2-8-76Z" />
              <path className="career-jarvis__boot" d="M208 447h42l8 23c-18 8-47 8-61 0Z" />
            </g>

            <g className="career-jarvis__torso">
              <path className="career-jarvis__body-suit" d="M123 155c17-19 36-29 57-29s41 10 57 29l18 67-26 91c-31 17-67 17-98 0l-26-91Z" />
              <path className="career-jarvis__shoulder-armor career-jarvis__shoulder-armor--left" d="M119 153c-26 4-41 17-47 40l39 14 21-48Z" />
              <path className="career-jarvis__shoulder-armor career-jarvis__shoulder-armor--right" d="M241 153c26 4 41 17 47 40l-39 14-21-48Z" />
              <path className="career-jarvis__chest-armor" d="m136 159 44 18 44-18 15 71-59 57-59-57Z" />
              <path className="career-jarvis__chest-panel" d="m144 174 36 15 36-15 8 42-44 41-44-41Z" />
              <path className="career-jarvis__waist-armor" d="m132 273 48 18 48-18 2 44-50 17-50-17Z" />
              <path className="career-jarvis__rim-line" d="M132 166 110 223m118-57 22 57M150 301l30 10 30-10" />
              <circle className="career-jarvis__core-glow" cx="180" cy="211" r="31" />
              <circle className="career-jarvis__core" cx="180" cy="211" r="14" />
              <path className="career-jarvis__core-ring" d="M180 183a28 28 0 1 1 0 56 28 28 0 0 1 0-56Zm0 8a20 20 0 1 0 0 40 20 20 0 0 0 0-40Z" />
            </g>

            <g className="career-jarvis__neck">
              <path d="M162 126v26h36v-26Z" />
              <path className="career-jarvis__neck-light" d="M166 143h28" />
            </g>

            <g className="career-jarvis__head">
              <path className="career-jarvis__head-shape" d="M143 64c6-30 68-34 76 2l-7 48-19 22h-27l-20-22Z" />
              <path className="career-jarvis__hair" d="M143 67c3-40 66-50 80-7-19-13-45-13-69 0l-8 22Z" />
              <path className="career-jarvis__visor" d="m151 83 25-8 33 7-5 18-25 5-25-5Z" />
              <path className="career-jarvis__visor-light" d="m158 87 18-5 25 5" />
              <path className="career-jarvis__face-line" d="M168 114c8 5 16 5 24 0" />
              <path className="career-jarvis__jaw-light" d="m151 102 8 20 10 8m40-28-8 20-10 8" />
            </g>

            <g className="career-jarvis__arm-group career-jarvis__arm-group--left">
              <path className="career-jarvis__upper-arm" d="M116 170c-24 16-35 43-35 77l26 4 35-63Z" />
              <path className="career-jarvis__forearm" d="m82 237-6 75 30 4 19-73Z" />
              <path className="career-jarvis__arm-panel" d="m87 246-2 55 15 2 13-54Z" />
              <path className="career-jarvis__hand" d="m76 303-9 23 13 18 21-14 5-18Z" />
            </g>

            <g className="career-jarvis__arm-group career-jarvis__arm-group--right">
              <path className="career-jarvis__upper-arm" d="M244 170c24 16 35 43 35 77l-26 4-35-63Z" />
              <path className="career-jarvis__forearm" d="m278 237 6 75-30 4-19-73Z" />
              <path className="career-jarvis__arm-panel" d="m273 246 2 55-15 2-13-54Z" />
              <path className="career-jarvis__hand" d="m284 303 9 23-13 18-21-14-5-18Z" />
              <g className="career-jarvis__signal">
                <circle className="career-jarvis__signal-aura" cx="288" cy="338" r="34" />
                <circle className="career-jarvis__signal-core" cx="288" cy="338" r="13" />
                <path className="career-jarvis__signal-rays" d="M288 313v-12m0 74v-12m-25-25h-12m74 0h-12m-42-17-9-9m61 61-9-9m0-43 9-9m-61 61 9-9" />
              </g>
            </g>
          </g>
        </svg>

        <span className="career-jarvis__ground-line" />
      </div>

      {dialogue ? (
        <div className="career-jarvis__dialogue">
          <span>{eyebrow}</span>
          <p>{dialogue}</p>
        </div>
      ) : null}
    </aside>
  );
}
