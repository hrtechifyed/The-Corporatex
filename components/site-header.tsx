import Link from 'next/link';

export function SiteHeader() {
  return <header className="site-header">
    <div className="site-header-inner">
      <Link href="/" className="brand-lockup" aria-label="The Corporate Ex home"><span className="brand-emblem" aria-hidden="true">EX</span><span>THE CORPORATE <b>EX</b></span></Link>
      <nav aria-label="Primary"><Link href="/browse">Meet the Ex</Link><Link href="/account">My Archive</Link><Link className="header-action" href="/submit">Tell Your Story <span>↗</span></Link></nav>
    </div>
  </header>;
}
