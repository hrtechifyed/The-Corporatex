'use client';

import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const primaryLinks = [
  ['Stories', '/browse'],
  ['How It Works', '/more#how-it-works'],
  ['About', '/more'],
] as const;

const idleWarmRoutes = ['/', '/browse', '/more', '/privacy', '/submit', '/login', '/account'] as const;

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19.2c.7-3.3 3-5 6.5-5s5.8 1.7 6.5 5" />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const isHome = pathname === '/';

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

  function normalizedPath(href: string) {
    return href.split('#')[0] || '/';
  }

  function isCurrent(href: string) {
    const target = normalizedPath(href);
    if (target === '/') return pathname === '/';
    if (target === '/browse') return pathname === '/browse' || pathname.startsWith('/experience/');
    return pathname === target || pathname.startsWith(`${target}/`);
  }

  function warm(href: string) {
    router.prefetch(normalizedPath(href));
  }

  function startNavigation(href: string, event: MouseEvent<HTMLAnchorElement>) {
    const target = normalizedPath(href);
    if (
      target === pathname ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    setPendingHref(target);
  }

  function navLink(label: ReactNode, href: string, className?: string) {
    const current = isCurrent(href);
    const target = normalizedPath(href);
    const pending = pendingHref === target;

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
    <header className="site-header" data-home={isHome ? 'true' : 'false'} data-route-pending={pendingHref ? 'true' : 'false'}>
      <div className="site-header-inner">
        <Link
          href="/"
          className="cx-brand"
          aria-label="HRTechify CorporateX home"
          prefetch
          onPointerEnter={() => warm('/')}
          onClick={(event: MouseEvent<HTMLAnchorElement>) => startNavigation('/', event)}
        >
          <img src="/hrtechify-logo.svg" alt="HRTechify" width="54" height="54" />
          <span className="cx-brand-parent">HRTechify</span>
          <span className="cx-brand-product">Corporate<span className="cx-brand-x">X</span></span>
        </Link>

        <nav className="cx-primary-nav" aria-label="Primary navigation">
          {primaryLinks.map(([label, href]) => navLink(label, href))}
          {navLink(<><UserIcon /><span>Sign In</span></>, '/login', 'cx-sign-in')}
        </nav>

        <details className="cx-menu">
          <summary aria-label="Open navigation"><span /></summary>
          <nav aria-label="Mobile navigation">
            {primaryLinks.map(([label, href]) => navLink(label, href))}
            {navLink('Privacy & Safety', '/privacy')}
            {navLink('Sign In', '/login')}
            {navLink('My drafts', '/account')}
            {navLink('Share Your Story', '/submit')}
          </nav>
        </details>
      </div>
    </header>
  );
}
