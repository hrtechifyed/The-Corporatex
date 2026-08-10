import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ENDINGS, endingFor } from '@/lib/endings';
import { LiveSignalCloud } from '@/components/live-signal-cloud';

function StoryCard({ story, index }: { story: any | null; index: number }) {
  if (!story) {
    return (
      <article className="cx-frozen-card cx-frozen-card--placeholder" aria-label={`Archive story slot ${index + 1} is waiting for a confirmed story`}>
        <div className="cx-frozen-card__image" aria-hidden="true" />
        <div className="cx-frozen-card__body">
          <h3>Archive forming</h3>
          <p>Waiting for a confirmed workplace story</p>
          <div className="cx-frozen-card__meta"><span className="cx-frozen-card__pill">Confirmed stories only</span><span>No demo account</span></div>
        </div>
      </article>
    );
  }

  const ending = endingFor(story.main_reason);
  const category = story.broad_function || ending.title;
  const context = story.broad_region || story.company_display_name || 'Workplace story';

  return (
    <Link className="cx-frozen-card" href={`/experience/${story.company_slug}/${story.public_slug}`}>
      <div className="cx-frozen-card__image" aria-hidden="true" />
      <div className="cx-frozen-card__body">
        <h3>{story.approved_headline || `${story.company_display_name || 'Workplace'} story`}</h3>
        <p>{story.approved_summary || ending.description}</p>
        <div className="cx-frozen-card__meta"><span className="cx-frozen-card__pill">{category}</span><span>{context}</span></div>
      </div>
    </Link>
  );
}

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const q = await searchParams;
  const supabase = await createClient();
  const [{ data: stories }, { count: publishedCount }] = await Promise.all([
    supabase.from('published_experiences').select('*').order('published_at', { ascending: false }).limit(6),
    supabase.from('published_experiences').select('id', { count: 'exact', head: true }),
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

  const frozenCards = Array.from({ length: 5 }, (_, index) => stories?.[index] ?? null);
  const trustCount = publishedCount && publishedCount > 0
    ? `${publishedCount} published ${publishedCount === 1 ? 'signal' : 'signals'} and counting`
    : 'The confirmed archive is forming';

  return (
    <div className="cx-frozen-home">
      <section className="cx-frozen-hero" aria-labelledby="frozen-home-title">
        <div className="cx-frozen-shell cx-frozen-hero-stage">
          <div className="cx-frozen-copy">
            <p className="cx-frozen-kicker">Why CorporateX</p>
            <h1 className="cx-frozen-display" id="frozen-home-title">
              <span>Not a score.</span>
              <span className="cx-frozen-sequence-line"><span>A</span><em className="cx-frozen-sequence">sequence.</em></span>
            </h1>
            <p className="cx-frozen-lede">A rating gives you a reaction. A story shows what was promised, what changed and what to ask before joining.</p>
            <div className="cx-frozen-actions">
              <Link className="cx-frozen-action cx-frozen-action--primary" href="/browse"><span aria-hidden="true">✦</span> Explore Stories <span aria-hidden="true">→</span></Link>
              <Link className="cx-frozen-action cx-frozen-action--secondary" href="/submit"><span aria-hidden="true">□</span> Share Your Story</Link>
            </div>
            <div className="cx-frozen-trust" aria-label="CorporateX story archive">
              <span className="cx-frozen-trust-copy">Real stories. Real people. Real clarity.</span>
              <span className="cx-frozen-avatar-stack" aria-hidden="true"><span /><span /><span /><span /></span>
              <span className="cx-frozen-trust-count">{trustCount}</span>
            </div>
          </div>

          <div className="cx-frozen-art" role="img" aria-label="Anime-style professional overlooking a city as a golden story path connects workplace moments." />

          <div className="cx-frozen-story-strip" aria-label="Latest confirmed workplace stories">
            {frozenCards.map((story, index) => <StoryCard story={story} index={index} key={story?.id || `placeholder-${index}`} />)}
          </div>
        </div>
      </section>

      {receipt ? (
        <section className="cx-shell cx-submission-receipt" style={{ gridTemplateColumns: '1fr' }} role="status" aria-live="polite">
          <div>
            <p className="cx-kicker">Journey complete</p>
            <h2>{receipt.status === 'published' ? 'Your signal is visible.' : 'Your signal is live while your story stays private.'}</h2>
            <p>{receipt.status === 'published' ? 'It now contributes to the shared archive.' : 'Safe theme labels from your verified contribution can now appear in the Live Signal Cloud as pending content validation. Your actual story is still private until moderation is complete.'}</p>
            <div className="cx-actions"><Link className="cx-button cx-button--ghost" href="/">Dismiss</Link><Link className="cx-button cx-button--ghost" href="/#live-signals">See the Live Signal Cloud</Link><Link className="cx-button cx-button--signal" href="/account">Open my archive</Link></div>
          </div>
        </section>
      ) : null}

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

      <LiveSignalCloud />

      <section className="cx-section cx-section--compact">
        <div className="cx-shell cx-journey-panel">
          <div className="cx-section-heading">
            <div><p className="cx-kicker">Pass it forward</p><h2 className="cx-title">Your ending could improve someone else’s beginning.</h2></div>
            <Link className="cx-button cx-button--signal" href="/submit">Begin with the Signal →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
