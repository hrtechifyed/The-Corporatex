import Link from 'next/link';

const links = [
  ['Home', '/'],
  ['Stories', '/browse'],
  ['More', '/more'],
  ['Privacy & Safety', '/privacy'],
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="cx-brand" aria-label="CorporateX home">
          <img src="/hrtechify-logo.svg" alt="" width="38" height="38" />
          <span>CorporateX</span>
        </Link>
        <nav className="cx-primary-nav" aria-label="Primary navigation">
          {links.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
          <Link className="cx-header-cta" href="/submit">Share Your Story <span aria-hidden="true">↗</span></Link>
        </nav>
        <details className="cx-menu">
          <summary aria-label="Open navigation"><span /></summary>
          <nav aria-label="Mobile navigation">
            {links.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
            <Link href="/account">My drafts</Link>
            <Link href="/submit">Share Your Story</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
