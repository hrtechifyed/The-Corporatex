import 'server-only';
import { createHash } from 'node:crypto';

type Bucket = { count: number; resetAt: number };

type Store = Map<string, Bucket>;

const globalStore = globalThis as typeof globalThis & { __corporatexRateLimit?: Store };
const store = globalStore.__corporatexRateLimit || new Map<string, Bucket>();
globalStore.__corporatexRateLimit = store;

function keyFor(scope: string, identifier: string) {
  const digest = createHash('sha256').update(identifier).digest('hex').slice(0, 24);
  return `${scope}:${digest}`;
}

export function enforceRateLimit(scope: string, identifier: string, limit: number, windowMs: number) {
  const now = Date.now();
  const key = keyFor(scope, identifier);
  const current = store.get(key);
  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (current.count >= limit) {
    const retrySeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    throw new Error(`Too many requests. Try again in about ${retrySeconds} seconds.`);
  }
  current.count += 1;
  store.set(key, current);
}

export function requestIpFromHeaders(headers: Headers) {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || headers.get('x-real-ip') || 'unknown';
}
