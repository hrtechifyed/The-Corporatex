import Link from 'next/link';
import { CinematicHeroArt, FilmStrip } from '@/components/cinematic-hero-art';
import { SceneIcon } from '@/components/scene-icons';
import { createClient } from '@/lib/supabase/server';

const paths = [
  { key: 'guide' as const, number: '01', title: 'Guided Story', copy: 'Let the Archivist guide you through the important scenes.' },
  { key: 'write' as const, number: '02', title: 'Director’s Cut', copy: 'No scripts. No HR-approved ending. Tell the complete story in your own words.' },
  { key: 'mix' as const, number: '03', title: 'Mix Both', copy: 'Start with the scenes that matter and add anything the script missed.' },
];

export default async function Home() {
  const supabase = await createClient();
  const { data: stories } = await supabase
    .from('published_experiences')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(3);

  return <>
    <section className="opening-scene grain">
      <div className="aurora aurora-one" aria-hidden="true" />
      <div className="aurora aurora-two" aria-hidden="true" />
      <div className="opening-grid">
        <div className="opening-copy">
          <p className="scene-tag"><span>01</span> Opening Scene</p>
          <p className="hero-kicker">ANONYMOUS · HUMAN · UNFILTERED</p>
          <h1>Why You Shouldn’t Meet My <em>“eX” Employer</em></h1>
          <p className="hero-trailer">Your recruiter showed you the trailer. Your ex-employer’s former employees lived through the entire season.</p>
          <p className="hero-description">An anonymous, AI-assisted workplace storytelling platform where former employees explain why they left and future candidates learn what to ask before joining.</p>
          <div className="hero-actions">
            <Link href="/submit" className="btn btn-primary">Tell Your Story <span>→</span></Link>
            <Link href="/browse" className="btn btn-secondary"><span className="play-dot">▶</span> Meet the Ex</Link>
          </div>
          <ul className="trust-line" aria-label="Platform commitments">
            <li><b>◇</b> Anonymous by design</li><li><b>✓</b> You approve every word</li><li><b>⌁</b> Human moderated</li>
          </ul>
        </div>
        <CinematicHeroArt />
      </div>
    </section>

    <FilmStrip />

    <section className="premiere-section">
      <div className="section-shell">
        <p className="scene-tag dark-tag"><span>02</span> Public Premiere</p>
        <div className="section-title-row">
          <h2>Meet the <em>Ex</em></h2>
          <p>Contributor-approved experiences, organised for clarity and reviewed by a human before publication.</p>
          <Link href="/browse" className="text-link">Browse all stories →</Link>
        </div>
        {stories?.length ? <div className="story-poster-grid">
          {stories.map((story:any, index:number) => <Link key={story.public_slug} href={`/experience/${story.company_slug}/${story.public_slug}`} className="story-poster">
            <div className={`poster-art poster-art-${index + 1}`} aria-hidden="true"><span className="poster-sun"/><span className="poster-city"/><span className="poster-figure"/><b>0{index + 1}</b></div>
            <div className="poster-copy"><span className="status status-published">Published · moderated</span><h3>{story.approved_headline}</h3><p>{story.approved_summary}</p><footer><span>Anonymous contributor</span><b>{story.hrt_id}</b></footer></div>
          </Link>)}
        </div> : <div className="empty-premiere">
          <div className="empty-frame" aria-hidden="true"><span>NO. 00</span><i/><i/><i/></div>
          <div><h3>The premiere slate is empty.</h3><p>Published, human-moderated stories will appear here. No demonstration stories are presented as real.</p><Link href="/submit" className="text-link">Be the first to tell a story →</Link></div>
        </div>}
      </div>
    </section>

    <section className="path-section grain">
      <div className="section-shell">
        <p className="scene-tag"><span>03</span> Choose Your Story Path</p>
        <div className="path-heading"><h2>One story.<br/><em>Three ways in.</em></h2><p>The format changes. Your meaning does not. Every route saves privately to your account.</p></div>
        <div className="path-grid">{paths.map(path => <Link href="/submit" className="path-panel" key={path.key}>
          <span className="path-number">PATH {path.number}</span><div className="path-icon"><SceneIcon kind={path.key}/></div><h3>{path.title}</h3><p>{path.copy}</p><span className="path-arrow">→</span>
        </Link>)}</div>
      </div>
    </section>

    <section className="curtain-section">
      <div className="curtain-art" aria-hidden="true"><div className="curtain-moon"/><div className="archivist-bust"/><span className="light-beam"/></div>
      <div className="curtain-copy"><p className="scene-tag"><span>04</span> Behind the Curtain</p><h2>Care before <em>cinema.</em></h2><p>AI organises; it does not judge. You approve; a human moderates. Nothing becomes public at the end of analysis.</p><div className="safety-list"><span><b>01</b> Meaning stays yours</span><span><b>02</b> Privacy in every scene</span><span><b>03</b> Humans review the final cut</span></div></div>
    </section>
  </>;
}
