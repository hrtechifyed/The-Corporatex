'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const links = [
  ['Home', '/'],
  ['Stories', '/browse'],
  ['More', '/more'],
  ['Privacy & Safety', '/privacy'],
] as const;

const idleWarmRoutes = ['/', '/more', '/privacy', '/submit'] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      idleWarmRoutes.forEach((href) => router.prefetch(href));
    }, 650);

    return () => window.clearTimeout(timer);
  }, [router]);

  useEffect(() => {
    if (!pendingHref) return;
    const safetyTimer = window.setTimeout(() => setPendingHref(null), 5000);
    return () => window.clearTimeout(safetyTimer);
  }, [pendingHref]);

  function isCurrent(href: string) {
    if (href === '/') return pathname === '/';
    if (href === '/browse') return pathname === '/browse' || pathname.startsWith('/experience/');
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function warm(href: string) {
    router.prefetch(href);
  }

  function startNavigation(href: string, event: MouseEvent<HTMLAnchorElement>) {
    if (
      href === pathname ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    setPendingHref(href);
  }

  function navLink(label: string, href: string, className?: string) {
    const current = isCurrent(href);
    const pending = pendingHref === href;

    return (
      <Link
        href={href}
        key={href}
        className={className}
        prefetch
        aria-current={current ? 'page' : undefined}
        data-pending={pending ? 'true' : 'false'}
        onPointerEnter={() => warm(href)}
        onFocus={() => warm(href)}
        onTouchStart={() => warm(href)}
        onClick={(event: MouseEvent<HTMLAnchorElement>) => startNavigation(href, event)}
      >
        {label}
      </Link>
    );
  }

  return (
    <header className="site-header" data-route-pending={pendingHref ? 'true' : 'false'}>
      <div className="site-header-inner">
        <Link
          href="/"
          className="cx-brand"
          aria-label="CorporateX home"
          prefetch
          onPointerEnter={() => warm('/')}
          onClick={(event: MouseEvent<HTMLAnchorElement>) => startNavigation('/', event)}
        >
          <img src="/hrtechify-logo.svg" alt="" width="38" height="38" />
          <span>CorporateX</span>
        </Link>

        <nav className="cx-primary-nav" aria-label="Primary navigation">
          {links.map(([label, href]) => navLink(label, href))}
          {navLink('Share Your Story ↗', '/submit', 'cx-header-cta')}
        </nav>

        <details className="cx-menu">
          <summary aria-label="Open navigation"><span /></summary>
          <nav aria-label="Mobile navigation">
            {links.map(([label, href]) => navLink(label, href))}
            {navLink('My drafts', '/account')}
            {navLink('Share Your Story', '/submit')}
          </nav>
        </details>
      </div>
    </header>
  );
}
