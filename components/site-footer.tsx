import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="cx-footer-brand">
          <Link href="/" className="cx-brand" aria-label="CorporateX home">
            <img src="/hrtechify-logo.svg" alt="" width="38" height="38" />
            <span>CorporateX</span>
          </Link>
          <p>Every exit leaves a signal. Some warn, some reassure, and all can help someone choose better.</p>
        </div>
        <nav className="cx-footer-nav" aria-label="Footer navigation">
          <Link href="/browse">Stories</Link>
          <Link href="/submit">Share Your Story</Link>
          <Link href="/more">More</Link>
          <Link href="/privacy">Privacy &amp; Safety</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/community-guidelines">Community guidelines</Link>
        </nav>
        <div className="cx-footer-bottom">
          <span>CorporateX — Powered by HRTechify · People · Technology · Growth</span>
          <span>© 2026 All Rights Reserved. Stories are contributor perspectives.</span>
        </div>
      </div>
    </footer>
  );
}
