type CareerJarvisPose =
  | 'arriving'
  | 'inviting'
  | 'listening'
  | 'pointing'
  | 'protecting'
  | 'releasing'
  | 'acknowledging'
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
        <svg className="career-jarvis__figure" viewBox="0 0 300 420" focusable="false">
          <defs>
            <linearGradient id="jarvis-body" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff8e9" />
              <stop offset="0.58" stopColor="#f4c275" />
              <stop offset="1" stopColor="#e8662f" />
            </linearGradient>
            <radialGradient id="jarvis-signal">
              <stop offset="0" stopColor="#fffce4" />
              <stop offset="0.38" stopColor="#ffd76a" />
              <stop offset="1" stopColor="#ff6a2b" />
            </radialGradient>
            <filter id="jarvis-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="11" />
            </filter>
          </defs>
          <ellipse className="career-jarvis__shadow" cx="150" cy="385" rx="76" ry="16" />
          <g className="career-jarvis__body">
            <path d="M116 170c8-28 22-42 34-42s26 14 34 42l25 136H91l25-136Z" fill="url(#jarvis-body)" />
            <path d="M112 186c-26 26-43 62-52 107" className="career-jarvis__arm career-jarvis__arm--left" />
            <path d="M188 186c26 26 43 62 52 107" className="career-jarvis__arm career-jarvis__arm--right" />
            <path d="M126 304 111 375M174 304l15 71" className="career-jarvis__legs" />
            <circle cx="150" cy="91" r="39" fill="url(#jarvis-body)" />
            <path d="M121 81c9-34 55-45 70-9-19-8-38-2-57 17Z" className="career-jarvis__hair" />
            <path d="M139 101c7 5 15 5 22 0" className="career-jarvis__face" />
            <circle cx="137" cy="91" r="2.5" className="career-jarvis__eye" />
            <circle cx="163" cy="91" r="2.5" className="career-jarvis__eye" />
            <path d="M127 162h46" className="career-jarvis__chest-line" />
            <circle cx="150" cy="191" r="10" className="career-jarvis__core" />
          </g>
          <g className="career-jarvis__signal">
            <circle cx="235" cy="214" r="43" fill="#ff8b36" opacity=".18" filter="url(#jarvis-glow)" />
            <circle cx="235" cy="214" r="22" fill="url(#jarvis-signal)" />
            <path d="M235 179v-16M235 265v-16M200 214h-16M286 214h-16M210 189l-12-12M272 251l-12-12M260 189l12-12M198 251l12-12" className="career-jarvis__signal-rays" />
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
