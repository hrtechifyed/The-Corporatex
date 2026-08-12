'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function send(event: string, path: string) {
  const payload = JSON.stringify({ event, path: path.slice(0, 160), at: Date.now() });
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon('/api/telemetry', new Blob([payload], { type: 'application/json' }));
    return;
  }
  void fetch('/api/telemetry', { method: 'POST', headers: { 'content-type': 'application/json' }, body: payload, keepalive: true });
}

export function FunnelTelemetry() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    send('page_view', pathname);
  }, [pathname]);

  useEffect(() => {
    function click(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-cx-event]') : null;
      const name = target?.dataset.cxEvent;
      if (name) send(name, window.location.pathname);
    }
    function funnel(event: Event) {
      const detail = (event as CustomEvent<{ event?: string }>).detail;
      if (detail?.event && /^[a-z0-9_:-]{3,64}$/i.test(detail.event)) send(detail.event, window.location.pathname);
    }
    document.addEventListener('click', click, { capture: true });
    window.addEventListener('corporatex:funnel', funnel);
    return () => {
      document.removeEventListener('click', click, { capture: true });
      window.removeEventListener('corporatex:funnel', funnel);
    };
  }, []);

  return null;
}
