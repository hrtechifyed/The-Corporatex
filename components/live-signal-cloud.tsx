import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const SAFE_LIVE_LABELS = new Set([
  'Leadership',
  'Workload',
  'Growth',
  'Compensation',
  'Wellbeing',
  'Culture',
  'Change',
  'AI',
  'Structure',
  'Expectations',
  'Other change',
  'Break Free',
  'Next Act',
  'Mixed Ending',
  'Pass the Torch',
]);

type ExperienceState = 'pending_moderation' | 'published';

type LiveSignal = {
  label: string;
  count: number;
  publishedCount: number;
  pendingCount: number;
};

function weightFor(count: number) {
  return Math.min(4, Math.max(1, count));
}

export async function LiveSignalCloud() {
  const publicClient = await createClient();
  const { data: publicLabels } = await publicClient
    .from('experience_labels')
    .select('experience_id,label')
    .limit(1200);

  const publishedByLabel = new Map<string, Set<string>>();
  for (const row of publicLabels || []) {
    const label = String(row.label || '').trim();
    const experienceId = String(row.experience_id || '').trim();
    if (!SAFE_LIVE_LABELS.has(label) || !experienceId) continue;
    const ids = publishedByLabel.get(label) || new Set<string>();
    ids.add(experienceId);
    publishedByLabel.set(label, ids);
  }

  const aggregate = new Map<string, LiveSignal>();
  for (const [label, ids] of publishedByLabel) {
    aggregate.set(label, { label, count: ids.size, publishedCount: ids.size, pendingCount: 0 });
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = createAdminClient();
      const { data: experiences } = await admin
        .from('experiences')
        .select('id,status')
        .in('status', ['pending_moderation', 'published'])
        .order('updated_at', { ascending: false })
        .limit(300);

      const stateByExperience = new Map<string, ExperienceState>();
      for (const row of experiences || []) {
        const status = row.status as ExperienceState;
        if (status === 'pending_moderation' || status === 'published') stateByExperience.set(String(row.id), status);
      }

      const ids = [...stateByExperience.keys()];
      if (ids.length) {
        const { data: labels } = await admin
          .from('experience_labels')
          .select('experience_id,label')
          .in('experience_id', ids)
          .limit(2000);

        const uniqueByLabel = new Map<string, Map<string, ExperienceState>>();
        for (const row of labels || []) {
          const label = String(row.label || '').trim();
          const experienceId = String(row.experience_id || '').trim();
          const status = stateByExperience.get(experienceId);
          if (!SAFE_LIVE_LABELS.has(label) || !status) continue;
          const entries = uniqueByLabel.get(label) || new Map<string, ExperienceState>();
          entries.set(experienceId, status);
          uniqueByLabel.set(label, entries);
        }

        aggregate.clear();
        for (const [label, entries] of uniqueByLabel) {
          let publishedCount = 0;
          let pendingCount = 0;
          for (const status of entries.values()) {
            if (status === 'published') publishedCount += 1;
            else pendingCount += 1;
          }
          aggregate.set(label, {
            label,
            count: publishedCount + pendingCount,
            publishedCount,
            pendingCount,
          });
        }
      }
    } catch (error) {
      console.error('CorporateX live signal cloud fell back to published labels', error);
    }
  }

  const liveSignals = [...aggregate.values()]
    .filter((signal) => signal.count > 0)
    .sort((a, b) => Number(b.pendingCount > 0) - Number(a.pendingCount > 0) || b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 18);

  const confirmedPatterns = [...publishedByLabel.entries()]
    .map(([label, ids]) => ({ label, count: ids.size }))
    .filter(({ count }) => count >= 5)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 12);

  return (
    <section className="cx-section" id="live-signals" aria-labelledby="live-signal-title">
      <div className="cx-shell">
        <p className="cx-kicker">Live Signal Cloud</p>
        <h2 className="cx-title" id="live-signal-title">What people are noticing right now.</h2>
        <p className="cx-lede">A safe theme label can appear here as soon as a verified story enters review. “Live” means the signal is visible in this cloud—not that the contributor’s story has been published.</p>
        <div className="cx-live-signal-legend" aria-label="Signal status legend">
          <span className="is-pending"><i aria-hidden="true" />Live · pending content validation</span>
          <span className="is-confirmed"><i aria-hidden="true" />Confirmed · from published stories</span>
        </div>

        {liveSignals.length ? (
          <div className="cx-live-signal-cloud" aria-label="Current workplace signal themes">
            {liveSignals.map((signal) => {
              const state = signal.pendingCount > 0 ? 'pending' : 'confirmed';
              const style = { '--signal-weight': weightFor(signal.count) } as React.CSSProperties;
              return state === 'confirmed' ? (
                <Link className="cx-live-signal-word" data-state={state} style={style} href={`/browse?q=${encodeURIComponent(signal.label)}`} key={signal.label}>{signal.label}</Link>
              ) : (
                <span className="cx-live-signal-word" data-state={state} style={style} title="A verified contribution carrying this safe theme is currently in private review." key={signal.label}>{signal.label}</span>
              );
            })}
          </div>
        ) : (
          <div className="cx-empty"><h3>The live cloud is waiting for its first signal.</h3><p>Once a verified contribution reaches review, its safe theme labels can appear here without exposing the private story.</p></div>
        )}

        <p className="cx-live-signal-note">Pending signals can change or disappear during content validation. The underlying story, company details and contributor identity remain private until the normal moderation process is complete.</p>

        <div className="cx-confirmed-patterns">
          <h3>Confirmed shared patterns</h3>
          <p>A theme becomes a shared pattern only after at least five separate published stories support it.</p>
          {confirmedPatterns.length ? (
            <div className="cx-signal-map" aria-label="Confirmed common story themes">
              {confirmedPatterns.map(({ label, count }) => <Link className="cx-signal-word" data-weight={Math.min(4, Math.max(1, count - 3))} href={`/browse?q=${encodeURIComponent(label)}`} key={label}>{label}</Link>)}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
