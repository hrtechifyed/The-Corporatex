import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ShareReport } from '@/components/share-report';
import { endingFor } from '@/lib/endings';

type P = { params: Promise<{ companySlug: string; experienceSlug: string }> };

async function getStory(p: Awaited<P['params']>) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('published_experiences')
    .select('*')
    .eq('public_slug', p.experienceSlug)
    .eq('company_slug', p.companySlug)
    .maybeSingle();
  if (!data) return null;
  const { data: highlights } = await supabase
    .from('experience_highlights')
    .select('category,content,sort_order')
    .eq('experience_id', data.id)
    .order('sort_order');
  return { ...data, experience_highlights: highlights || [] } as any;
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const p = await params;
  const story = await getStory(p);
  if (!story) return {};
  const path = `/experience/${p.companySlug}/${p.experienceSlug}`;
  return {
    title: story.approved_headline,
    description: story.approved_summary,
    alternates: { canonical: path },
    openGraph: { title: story.approved_headline, description: story.approved_summary, type: 'article', url: path, publishedTime: story.published_at },
    twitter: { card: 'summary_large_image', title: story.approved_headline, description: story.approved_summary },
  };
}

export default async function Story({ params }: P) {
  const story = await getStory(await params);
  if (!story) notFound();
  const ending = endingFor(story.main_reason);
  const highlights = story.experience_highlights as Array<{ category: string; content: string; sort_order: number }>;
  const positive = highlights.find((item) => ['positive_moments', 'who_may_thrive', 'growth_promotion'].includes(item.category));
  const caution = highlights.find((item) => ['recurring_conflict', 'final_trigger', 'workload_boundaries', 'reality_check'].includes(item.category));

  return (
    <article className="cx-page">
      <header className="cx-story-hero">
        <div className="cx-shell cx-story-hero-grid">
          <div>
            <span className="cx-ending-badge">{ending.title}</span>
            <p className="cx-kicker" style={{ marginTop: '1.5rem' }}>One contributor’s signal · {story.company_display_name}</p>
            <h1 className="cx-title">{story.approved_headline}</h1>
            <p className="cx-lede">{story.approved_summary}</p>
            <dl className="cx-story-meta-grid">
              {[
                ['Role', story.broad_function],
                ['Region', story.broad_region],
                ['Tenure', story.approximate_tenure],
                ['Arrangement', story.work_arrangement],
                ['Ending', ending.title],
                ['Contributor', story.hrt_id],
              ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Not stated'}</dd></div>)}
            </dl>
          </div>
          <div className="cx-frozen-mini-art" aria-hidden="true" />
        </div>
      </header>

      <div className="cx-shell">
        <nav className="cx-chapter-nav" aria-label="Story beats">
          {highlights.map((highlight) => (
            <a href={`#${highlight.category}`} key={highlight.category}>{highlight.category.replaceAll('_', ' ')}</a>
          ))}
        </nav>

        <div className="cx-story-chapters">
          {highlights.map((highlight, index) => (
            <section className="cx-story-chapter" id={highlight.category} data-number={String(index + 1).padStart(2, '0')} key={highlight.category}>
              <p className="cx-kicker">Story Beat {String(index + 1).padStart(2, '0')}</p>
              <h2>{highlight.category.replaceAll('_', ' ')}</h2>
              <p>{highlight.content}</p>
            </section>
          ))}
        </div>

        <section aria-labelledby="decision-title">
          <p className="cx-kicker">Use the signal forward</p>
          <h2 className="cx-title" id="decision-title">What this story helps you decide.</h2>
          <div className="cx-decision-grid">
            <article className="cx-decision-card">
              <span>01 · WHY SOMEONE MAY JOIN</span>
              <h3>Look for the fit.</h3>
              <p>{positive?.content || ending.guidance}</p>
            </article>
            <article className="cx-decision-card">
              <span>02 · WHAT TO WATCH</span>
              <h3>Notice the change.</h3>
              <p>{caution?.content || 'Read the full sequence and compare it with current information about the role and team.'}</p>
            </article>
            <article className="cx-decision-card">
              <span>03 · QUESTION TO ASK</span>
              <h3>Take the signal into the interview.</h3>
              <p>Ask what has changed in the role, expectations and team since the period described in this story.</p>
            </article>
          </div>
        </section>

        <ShareReport id={story.id} title={story.approved_headline} reference={`${story.hrt_id} · ${story.company_display_name} · ${story.public_slug}`} />
        <aside className="cx-journey-panel cx-note" style={{ marginBottom: '5rem' }}>
          This is one contributor’s personal account. CorporateX does not independently verify it as a statement about the whole company. Look for repeated patterns and conduct your own research.
        </aside>
      </div>
    </article>
  );
}
