import Link from 'next/link';
import { CareerJarvis } from '@/components/career-jarvis';
import { createClient } from '@/lib/supabase/server';
import { ENDINGS, endingFor } from '@/lib/endings';

const fallbackSignals = [
  ['Career growth', 4],
  ['Leadership', 4],
  ['Work-life balance', 3],
  ['Learning', 3],
  ['Compensation', 2],
  ['Culture', 3],
  ['Job security', 2],
  ['Strong teams', 2],
  ['AI pressure', 1],
  ['Healthy transition', 2],
] as const;

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const q = await searchParams;
  const supabase = await createClient();
  const [{ data: stories }, { data: labels }] = await Promise.all([
    supabase.from('published_experiences').select('*').order('published_at', { ascending: false }).limit(6),
    supabase.from('experience_labels').select('label').limit(250),
  ]);

  let receipt: any = null;
  if (/^[0-9a-f-]{36}$/i.test(q.submitted || '')) {
    const { data } = await supabase
      .from('experiences')
      .select('id,status,approved_headline,main_reason,companies(display_name)')
      .eq('id', q.submitted)
      .maybeSingle();
    receipt = data;
  }

  const counts = new Map<string, number>();
  for (const row of labels || []) counts.set(row.label, (counts.get(row.label) || 0) + 1);
  const signals = counts.size
    ? [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([label, count]) => [label, Math.min(4, Math.max(1, count))] as const)
    : fallbackSignals;

  return (
    <div className="cx-page">
      {receipt ? (
        <section className="cx-shell cx-submission-receipt" role="status" aria-live="polite">
          <CareerJarvis compact pose={receipt.status === 'published' ? 'releasing' : 'protecting'} dialogue={receipt.status === 'published' ? 'Your signal is live in the archive.' : 'Your signal is safe and has entered the review path.'} />
          <div>
            <p className="cx-kicker">Journey complete</p>
            <h2>{receipt.status === 'published' ? 'Your signal is visible.' : 'Your story is safely submitted.'}</h2>
            <p>{receipt.status === 'published' ? 'It now contributes to the shared archive.' : 'It remains private while the safety review is completed. Difficult or critical opinions are not a reason for removal.'}</p>
            <div className="cx-actions"><Link className="cx-button cx-button--ghost" href="/">Dismiss</Link><Link className="cx-button cx-button--signal" href="/account">Open my archive</Link></div>
          </div>
        </section>
      ) : null}

      <section className="cx-hero">
        <div className="cx-shell cx-hero-grid">
          <div className="cx-hero-copy">
            <p className="cx-kicker">Workplace signals from people who were there</p>
            <h1 className="cx-display">Every exit leaves a <em>signal.</em></h1>
            <p className="cx-lede">Some warn. Some reassure. All can help someone choose better.</p>
            <div className="cx-actions">
              <Link className="cx-button cx-button--signal" href="/submit">Share Your Story <span aria-hidden="true">→</span></Link>
              <Link className="cx-button cx-button--ghost" href="/browse">Explore Stories</Link>
            </div>
            <ul className="cx-trust-line" aria-label="CorporateX commitments">
              <li><b>◇</b> Anonymous by design</li>
              <li><b>✓</b> You control every word</li>
              <li><b>⌁</b> Safety screen, not opinion control</li>
            </ul>
          </div>
          <div className="cx-hero-visual">
            <span className="cx-signal-path" aria-hidden="true" />
            <CareerJarvis pose="releasing" dialogue="I’m CareerJarvis. I’ll help turn your experience into a signal someone else can use." />
          </div>
        </div>
      </section>

      <section className="cx-section" aria-labelledby="ending-title">
        <div className="cx-shell">
          <p className="cx-kicker">Four honest endings</p>
          <h2 className="cx-title" id="ending-title">An exit is not always a warning.</h2>
          <p className="cx-lede">Relief, progress, mixed truth and genuine recommendation all carry useful information.</p>
          <div className="cx-ending-grid">
            {ENDINGS.map((ending, index) => (
              <Link className="cx-ending-card" data-ending={ending.slug} href={`/browse?ending=${encodeURIComponent(ending.value)}`} key={ending.value}>
                <span className="cx-ending-card__scene" aria-hidden="true"><span className="cx-ending-card__sun" /><span className="cx-ending-card__door" /><span className="cx-ending-card__person" /></span>
                <span className="cx-ending-card__copy"><span>Ending {String(index + 1).padStart(2, '0')}</span><h3>{ending.title}</h3><p>{ending.description}</p></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="cx-section cx-light-section" aria-labelledby="stories-title">
        <div className="cx-shell">
          <div className="cx-section-heading">
            <div><p className="cx-kicker">Signals from people who were there</p><h2 className="cx-title" id="stories-title">Stories for the decision ahead.</h2></div>
            <Link className="cx-button cx-button--quiet" href="/browse">Explore all stories →</Link>
          </div>
          {stories?.length ? (
            <div className="cx-story-grid">
              {stories.slice(0, 6).map((story: any) => {
                const ending = endingFor(story.main_reason);
                return (
                  <Link className="cx-story-card" href={`/experience/${story.company_slug}/${story.public_slug}`} key={story.id}>
                    <div><div className="cx-story-card__art" aria-hidden="true" /><span className="cx-ending-badge">{ending.title}</span><h3>{story.approved_headline}</h3><p>{story.approved_summary}</p></div>
                    <footer><span>{story.company_display_name}</span><span>{story.broad_function || 'Workplace story'} · {story.broad_region || 'Broad location'}</span></footer>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="cx-empty"><h3>The archive is waiting for its first confirmed signal.</h3><p>No demonstration story is presented as a real employee account.</p><Link className="cx-button cx-button--signal" href="/submit">Share the first story</Link></div>
          )}
        </div>
      </section>

      <section className="cx-section" aria-labelledby="signal-map-title">
        <div className="cx-shell">
          <p className="cx-kicker">Shared intelligence</p>
          <h2 className="cx-title" id="signal-map-title">What people notice before they move on.</h2>
          <p className="cx-lede">Themes grow only when they repeat across separate confirmed stories.</p>
          <div className="cx-signal-map" aria-label="Common story themes">
            {signals.map(([label, weight]) => <Link className="cx-signal-word" data-weight={weight} href={`/browse?q=${encodeURIComponent(label)}`} key={label}>{label}</Link>)}
          </div>
        </div>
      </section>

      <section className="cx-section cx-section--compact">
        <div className="cx-shell cx-journey-panel">
          <div className="cx-section-heading">
            <div><p className="cx-kicker">Pass it forward</p><h2 className="cx-title">Your ending could improve someone else’s beginning.</h2></div>
            <Link className="cx-button cx-button--signal" href="/submit">Begin with CareerJarvis →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
