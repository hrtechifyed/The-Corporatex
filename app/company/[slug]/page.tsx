import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { endingFor } from '@/lib/endings';

type LabelRow = { label: string };

export default async function Company({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: stories } = await supabase
    .from('published_experiences')
    .select('*')
    .eq('company_slug', slug)
    .order('published_at', { ascending: false });

  if (!stories?.length) {
    const { data: company } = await supabase.from('companies').select('display_name').eq('slug', slug).maybeSingle();
    if (!company) notFound();
    return (
      <div className="cx-page"><section className="cx-section"><div className="cx-shell"><p className="cx-kicker">Employer signals</p><h1 className="cx-title">{company.display_name}</h1><div className="cx-journey-panel"><h2>No confirmed stories yet.</h2><p className="cx-note">CorporateX does not fill empty archives with fictional employee submissions.</p></div></div></section></div>
    );
  }

  const { data: labelRows } = stories.length >= 3
    ? await supabase.from('experience_labels').select('label').in('experience_id', stories.map((story) => story.id))
    : { data: [] as LabelRow[] };
  const themes = (labelRows ?? []).reduce<Record<string, number>>((counts, row) => {
    const label = String(row.label || '').trim();
    if (label) counts[label] = (counts[label] || 0) + 1;
    return counts;
  }, {});
  const repeatedThemes = Object.entries(themes).filter(([, count]) => count >= 2);

  return (
    <div className="cx-page">
      <section className="cx-archive-hero">
        <div className="cx-shell">
          <p className="cx-kicker">Employer signals</p>
          <h1 className="cx-display">{stories[0].company_display_name}</h1>
          <p className="cx-lede">Separate contributor perspectives. Look for repeated signals, not a single verdict.</p>
          {stories.length >= 3 && repeatedThemes.length ? (
            <div className="cx-signal-map" aria-label="Repeated contributor-reported themes">
              {repeatedThemes.map(([theme, count]) => <span className="cx-signal-word" data-weight={Math.min(4, count)} key={theme}>{theme} · {count}</span>)}
            </div>
          ) : null}
        </div>
      </section>
      <section className="cx-shell cx-archive-grid">
        {stories.map((story) => {
          const ending = endingFor(story.main_reason);
          return (
            <Link href={`/experience/${slug}/${story.public_slug}`} className="cx-archive-card" key={story.id}>
              <span className="cx-archive-card__art" aria-hidden="true" />
              <span><span className="cx-ending-badge">{ending.title}</span><h2>{story.approved_headline}</h2><p>{story.approved_summary}</p></span>
              <span className="cx-card-arrow" aria-hidden="true">→</span>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
