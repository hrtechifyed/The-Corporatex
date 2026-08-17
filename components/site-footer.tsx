import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid !grid-cols-1 !items-center !gap-4 text-center md:!grid-cols-[1fr_auto_1fr] md:text-left">
        <div className="text-sm font-semibold md:justify-self-start">
          CorporateX by HRTechify
        </div>
        <nav className="cx-footer-nav !justify-center !gap-2" aria-label="Footer navigation">
          <Link href="/about">About</Link>
          <span aria-hidden="true">·</span>
          <Link href="/privacy">Privacy</Link>
          <span aria-hidden="true">·</span>
          <a href="mailto:hrtechifyed@gmail.com">Contact</a>
        </nav>
        <div className="text-sm text-[#8f8183] md:justify-self-end md:text-right">
          © 2026 HRTechify. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
