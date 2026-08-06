import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ENDINGS, endingFor } from '@/lib/endings';

export default async function Browse({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const q = await searchParams;
  const supabase = await createClient();
  let query = supabase.from('published_experiences').select('*');

  const term = (q.q || '').replace(/[,%()]/g, '').slice(0, 80);
  if (term) query = query.or(`approved_headline.ilike.%${term}%,approved_summary.ilike.%${term}%,company_display_name.ilike.%${term}%`);
  if (q.ending) query = query.eq('main_reason', q.ending);
  if (q.company) query = query.ilike('company_display_name', `%${q.company.replaceAll('%', '').slice(0, 80)}%`);
  if (q.region) query = query.ilike('broad_region', `%${q.region.replaceAll('%', '').slice(0, 80)}%`);

  const { data, error } = await query.order('published_at', { ascending: q.date === 'oldest' }).limit(60);

  return (
    <div className="cx-page">
      <section className="cx-archive-hero">
        <div className="cx-shell">
          <p className="cx-kicker">Signal Archive</p>
          <h1 className="cx-display">Stories for the <em>decision ahead.</em></h1>
          <p className="cx-lede">See what worked, what changed and what future candidates should ask.</p>
          <form className="cx-filter-panel" aria-label="Filter workplace stories">
            <label className="cx-field">
              <span>Search</span>
              <input className="cx-input" type="search" name="q" defaultValue={q.q} placeholder="Employer, signal or story" />
            </label>
            <label className="cx-field">
              <span>Ending</span>
              <select className="cx-select" name="ending" defaultValue={q.ending || ''}>
                <option value="">Every ending</option>
                {ENDINGS.map((ending) => <option value={ending.value} key={ending.value}>{ending.title}</option>)}
              </select>
            </label>
            <label className="cx-field">
              <span>Region</span>
              <input className="cx-input" name="region" defaultValue={q.region} placeholder="Broad location" />
            </label>
            <button className="cx-button cx-button--signal" type="submit">Find signals</button>
          </form>
        </div>
      </section>

      <section className="cx-shell cx-archive-grid" aria-label="Published workplace stories">
        {error ? (
          <div className="cx-journey-panel" role="alert">
            <h2>The archive could not load.</h2>
            <p className="cx-note">{error.message}</p>
          </div>
        ) : !data?.length ? (
          <div className="cx-journey-panel">
            <p className="cx-kicker">No matching signals</p>
            <h2 className="cx-title">Try a wider search.</h2>
            <p className="cx-lede">The archive only displays genuine, published contributor stories.</p>
            <div className="cx-actions"><Link className="cx-button cx-button--ghost" href="/browse">Clear filters</Link><Link className="cx-button cx-button--signal" href="/submit">Share Your Story</Link></div>
          </div>
        ) : data.map((story: any) => {
          const ending = endingFor(story.main_reason);
          return (
            <Link className="cx-archive-card" href={`/experience/${story.company_slug}/${story.public_slug}`} key={story.id}>
              <span className="cx-archive-card__art" aria-hidden="true" />
              <span>
                <span className="cx-ending-badge">{ending.title}</span>
                <h2>{story.approved_headline}</h2>
                <p>{story.approved_summary}</p>
                <span className="cx-archive-card__meta">
                  <span>{story.company_display_name}</span>
                  <span>{story.broad_function || 'Function not stated'}</span>
                  <span>{story.broad_region || 'Broad location not stated'}</span>
                  <span>{story.approximate_tenure || 'Tenure not stated'}</span>
                </span>
              </span>
              <span className="cx-card-arrow" aria-hidden="true">→</span>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
