import 'server-only';
import { headers } from 'next/headers';

function normalizedHttpOrigin(value: string | null | undefined) {
  const candidate = String(value || '').trim().replace(/\/$/, '');
  if (!candidate) return null;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

function isLocalOrigin(origin: string) {
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return host === 'localhost' || host === '127.0.0.1' || host === '::1';
  } catch {
    return true;
  }
}

export async function getSiteOrigin() {
  const configured = normalizedHttpOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  if (configured && !isLocalOrigin(configured)) return configured;

  const requestHeaders = await headers();
  const forwardedHost = (requestHeaders.get('x-forwarded-host') || requestHeaders.get('host') || '')
    .split(',')[0]
    .trim();
  const forwardedProto = (requestHeaders.get('x-forwarded-proto') || '')
    .split(',')[0]
    .trim()
    .toLowerCase();

  if (forwardedHost) {
    const protocol = forwardedProto === 'http' || forwardedProto === 'https'
      ? forwardedProto
      : forwardedHost.startsWith('localhost') || forwardedHost.startsWith('127.0.0.1')
        ? 'http'
        : 'https';
    const requestOrigin = normalizedHttpOrigin(`${protocol}://${forwardedHost}`);
    if (requestOrigin) return requestOrigin;
  }

  return configured || 'http://localhost:3000';
}
