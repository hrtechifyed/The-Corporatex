import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="cx-footer-brand">
          <Link href="/" className="cx-brand" aria-label="HRTechify CorporateX home">
            <img src="/hrtechify-logo.svg" alt="HRTechify" width="52" height="52" />
            <span className="cx-brand-parent">HRTechify</span>
            <span className="cx-brand-product">Corporate<span className="cx-brand-x">X</span></span>
          </Link>
          <p>Not a score. A sequence. Real workplace stories that help people understand what was promised, what changed and what to ask before joining.</p>
        </div>
        <nav className="cx-footer-nav" aria-label="Footer navigation">
          <Link href="/browse">Stories</Link>
          <Link href="/more#how-it-works">How It Works</Link>
          <Link href="/more">About</Link>
          <Link href="/submit">Share Your Story</Link>
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
