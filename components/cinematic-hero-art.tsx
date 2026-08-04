export function CinematicHeroArt() {
  return (
    <div className="cinematic-visual" aria-hidden="true">
      <svg className="cinematic-sky" viewBox="0 0 760 690" role="img">
        <defs>
          <radialGradient id="sun" cx="42%" cy="38%">
            <stop offset="0" stopColor="#fff2c9" />
            <stop offset=".48" stopColor="#ffc75c" />
            <stop offset=".74" stopColor="#ed6a29" />
            <stop offset="1" stopColor="#8f242d" />
          </radialGradient>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#451721" />
            <stop offset=".55" stopColor="#25121b" />
            <stop offset="1" stopColor="#100a10" />
          </linearGradient>
          <linearGradient id="coat" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#0b090d" />
            <stop offset=".5" stopColor="#26141d" />
            <stop offset="1" stopColor="#09080b" />
          </linearGradient>
          <pattern id="halftone" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#fff" opacity=".18" />
          </pattern>
          <filter id="glow"><feGaussianBlur stdDeviation="18" /></filter>
        </defs>
        <rect width="760" height="690" rx="30" fill="url(#sky)" />
        <circle cx="510" cy="216" r="172" fill="#ed6a29" opacity=".28" filter="url(#glow)" />
        <circle cx="510" cy="216" r="142" fill="url(#sun)" />
        <circle cx="510" cy="216" r="142" fill="url(#halftone)" />
        <g fill="#301622" opacity=".75">
          <path d="M0 410h65V300h48v110h45V337h72v73h53V245h64v165h54V318h45v92h70V278h68v132h53V336h73v74h50v280H0z" />
        </g>
        <g fill="#100b11">
          <path d="M0 478h85V364h71v114h52V296h74v182h83V387h56v91h79V330h84v148h60V379h74v99h42v212H0z" />
          <path d="M402 690c10-122 16-215 52-283 12-23 35-35 59-35s47 12 59 35c37 70 42 162 53 283H402z" />
          <ellipse cx="513" cy="339" rx="48" ry="60" />
          <path d="M471 319c4-61 22-91 61-89 31 2 53 27 56 71l-24-22-2 38-30-45-20 43-9-35z" />
        </g>
        <path d="M426 690l29-262 56 33 60-33 33 262z" fill="url(#coat)" />
        <path d="M455 428l56 33 60-33-24 75-36-42-34 43z" fill="#f4e7d4" opacity=".78" />
        <g stroke="#f6b65e" strokeWidth="2" opacity=".42">
          <path d="M34 128h170M19 154h130M598 68h122M628 94h110" />
          <path d="M78 240l116-62M62 266l152-80" />
        </g>
      </svg>
      <div className="manga-panel manga-panel-main">
        <span>ANONYMOUS FILE · 014</span>
        <strong>“The role I joined<br />wasn’t the role<br />I was living.”</strong>
        <i />
      </div>
      <div className="manga-panel manga-panel-side"><span>THE FINAL ARC</span><b>Truth, without theatre.</b></div>
      <div className="archivist-label"><b>THE ARCHIVIST</b><small>Story guide · Identity protected</small></div>
    </div>
  );
}

export function FilmStrip() {
  return <div className="film-strip" aria-hidden="true"><span>OPENING SCENE</span><i>◆</i><span>PRIVATE DRAFT</span><i>◆</i><span>FINAL CUT</span><i>◆</i><span>PUBLIC PREMIERE</span></div>;
}
