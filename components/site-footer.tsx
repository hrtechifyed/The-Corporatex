import Link from 'next/link';

export function SiteFooter() {
  return <footer className="site-footer"><div className="footer-grid">
    <div><div className="brand-lockup"><span className="brand-emblem" aria-hidden="true">EX</span><span>THE CORPORATE <b>EX</b></span></div><p>Workplace stories, told responsibly.</p></div>
    <nav aria-label="Legal"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/community-guidelines">Community guidelines</Link></nav>
    <div className="logo-development-note"><span>HRTECHIFY BRAND ATTRIBUTION</span><strong>Original logo asset required</strong><p>The verified artwork is not present in this repository. No substitute mark is being shown.</p></div>
    <small>© 2026 The Corporate Ex · Contributor perspectives are not independently verified company facts.</small>
  </div></footer>;
}
