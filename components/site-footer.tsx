import Link from 'next/link';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="cx-footer-brand">
          <Link href="/" className="cx-brand" aria-label="HRTechify CorporateX home">
            <img src="/hrtechify-logo.svg" alt="HRTechify" width="52" height="52" />
            <span className="cx-brand-parent">HRTechify</span>
            <span className="cx-brand-product">Corporate<span className="cx-brand-x">X</span></span>
          </Link>
          <p>Workplace stories, structured for better career decisions.</p>
        </div>
        <nav className="cx-footer-nav" aria-label="Footer navigation">
          <Link href="/browse">Stories</Link>
          <Link href="/more#how-it-works">How It Works</Link>
          <Link href="/about">About</Link>
          <Link href="/submit">Share Your Story</Link>
          <Link href="/privacy">Privacy &amp; Safety</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/community-guidelines">Community Guidelines</Link>
        </nav>
        <div className="cx-footer-bottom">
          <span>© {year} HRTechify. All rights reserved.</span>
          <span>Contributor stories reflect individual perspectives and are moderated before publication.</span>
        </div>
      </div>
    </footer>
  );
}
