const base = (process.env.CORPORATEX_BASE_URL || 'https://corporatex.onrender.com').replace(/\/$/, '');
const endpoints = ['/api/health', '/', '/browse', '/more'];
const requestsPerEndpoint = Number(process.env.CORPORATEX_SMOKE_REQUESTS || 10);
const concurrency = Math.max(1, Math.min(10, Number(process.env.CORPORATEX_SMOKE_CONCURRENCY || 5)));
const timeoutMs = Number(process.env.CORPORATEX_SMOKE_TIMEOUT_MS || 15000);
const warmTimeoutMs = Number(process.env.CORPORATEX_WARM_TIMEOUT_MS || 60000);
const readinessWindowMs = Number(process.env.CORPORATEX_READINESS_WINDOW_MS || 8 * 60 * 1000);
const p95LimitMs = Number(process.env.CORPORATEX_SMOKE_P95_MS || 12000);

async function timedFetch(path, requestTimeoutMs = timeoutMs) {
  const started = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    const response = await fetch(`${base}${path}`, { signal: controller.signal, headers: { 'user-agent': 'CorporateX-Prelaunch-Smoke/1.0' } });
    const duration = performance.now() - started;
    await response.arrayBuffer();
    return { path, ok: response.ok, status: response.status, duration };
  } catch (error) {
    return { path, ok: false, status: 0, duration: performance.now() - started, error: error instanceof Error ? error.message : 'request failed' };
  } finally {
    clearTimeout(timer);
  }
}

async function waitForProductionReadiness() {
  const deadline = Date.now() + readinessWindowMs;
  let attempt = 0;
  let last = null;
  while (Date.now() < deadline) {
    attempt += 1;
    last = await timedFetch('/api/health', warmTimeoutMs);
    if (last.ok) {
      console.log(`Production health became ready after ${attempt} readiness attempt${attempt === 1 ? '' : 's'} (${Math.round(last.duration)}ms).`);
      return;
    }
    const remaining = Math.max(0, deadline - Date.now());
    console.log(`Production not ready yet: HTTP ${last.status} ${last.error || ''}. ${Math.ceil(remaining / 1000)}s readiness window remains.`);
    if (remaining <= 0) break;
    await new Promise((resolve) => setTimeout(resolve, Math.min(15000, remaining)));
  }
  throw new Error(`Production did not become ready within ${Math.round(readinessWindowMs / 1000)} seconds. Last health result: HTTP ${last?.status || 0} ${last?.error || ''}`);
}

// Deployment and cold-start readiness are not performance measurements. Wait for the service
// to become healthy first, then warm each page before measuring steady-state launch traffic.
await waitForProductionReadiness();
for (const path of endpoints) {
  const warm = await timedFetch(path, warmTimeoutMs);
  if (!warm.ok) throw new Error(`Warm-up failed for ${path}: HTTP ${warm.status} ${warm.error || ''}`);
}

const queue = endpoints.flatMap((path) => Array.from({ length: requestsPerEndpoint }, () => path));
const results = [];
let cursor = 0;

async function worker() {
  while (cursor < queue.length) {
    const index = cursor++;
    results[index] = await timedFetch(queue[index]);
  }
}
await Promise.all(Array.from({ length: concurrency }, () => worker()));

const failures = results.filter((result) => !result.ok);
const durations = results.map((result) => result.duration).sort((a, b) => a - b);
const p95 = durations[Math.min(durations.length - 1, Math.ceil(durations.length * .95) - 1)] || 0;
const max = durations.at(-1) || 0;
const average = durations.reduce((sum, value) => sum + value, 0) / Math.max(1, durations.length);

console.log(JSON.stringify({
  base,
  requests: results.length,
  concurrency,
  failures: failures.length,
  measuredTimeoutMs: timeoutMs,
  p95LimitMs,
  averageMs: Math.round(average),
  p95Ms: Math.round(p95),
  maxMs: Math.round(max),
  byEndpoint: Object.fromEntries(endpoints.map((path) => {
    const subset = results.filter((result) => result.path === path);
    return [path, { requests: subset.length, failures: subset.filter((item) => !item.ok).length, maxMs: Math.round(Math.max(...subset.map((item) => item.duration))) }];
  })),
}, null, 2));

if (failures.length) throw new Error(`${failures.length} production smoke requests failed.`);
if (p95 > p95LimitMs) throw new Error(`Production p95 ${Math.round(p95)}ms exceeds the ${p95LimitMs}ms prelaunch ceiling.`);
