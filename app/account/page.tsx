import type { Metadata } from 'next';
import Link from 'next/link';
import { requireProfile } from '@/lib/auth';
import { endingFor } from '@/lib/endings';

export const metadata: Metadata = { title: 'My Stories', robots: { index: false, follow: false } };

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft — verification not completed',
  awaiting_ai_analysis: 'Preparing private review',
  awaiting_user_approval: 'Preparing private review',
  pending_moderation: 'In private review',
  changes_requested: 'Changes requested',
  published: 'Published',
  rejected: 'Not published',
  withdrawn: 'Withdrawn',
};

const STATUS_EXPLANATIONS: Record<string, string> = {
  draft: 'The private recoverable draft exists, but verification/submission is not complete.',
  awaiting_ai_analysis: 'CorporateX is preparing this verified contribution for private review.',
  awaiting_user_approval: 'CorporateX is preparing this verified contribution for private review.',
  pending_moderation: 'A moderator will review the exact public version before anything can be published.',
  changes_requested: 'A moderator asked for a change. Open the story to revise the current Final Cut.',
  published: 'The moderator-reviewed version is in the public archive.',
  rejected: 'This story was not published. It remains private to your account unless you delete it.',
  withdrawn: 'This story is no longer in the public/review path.',
};

export default async function Account() {
  const { supabase, profile } = await requireProfile();
  const { data } = await supabase
    .from('experiences')
    .select('id,status,approved_headline,main_reason,created_at,updated_at,companies(display_name)')
    .eq('profile_id', profile.id)
    .order('updated_at', { ascending: false });

  return (
    <div className="cx-page">
      <section className="cx-section">
        <div className="cx-shell">
          <p className="cx-kicker">Private Signal Archive</p>
          <h1 className="cx-title">Your stories.</h1>
          <p className="cx-lede">Anonymous identity: <strong>{profile.hrt_id}</strong>. Your private email is not displayed on public stories.</p>
          <div className="cx-record-grid">
            {data?.length ? data.map((record: any) => {
              const company = Array.isArray(record.companies) ? record.companies[0]?.display_name : record.companies?.display_name;
              const ending = endingFor(record.main_reason);
              return (
                <article className="cx-record" key={record.id}>
                  <div className="cx-account-action-row"><span className="cx-ending-badge">{ending.title}</span><span className="cx-status-pill">{STATUS_LABELS[record.status] || 'Private story'}</span></div>
                  <h2>{record.approved_headline || `${company || 'Company'} private story`}</h2>
                  <p className="cx-note">{STATUS_EXPLANATIONS[record.status] || 'This record is held privately in your CorporateX archive.'}</p>
                  <p className="cx-note">Updated {new Date(record.updated_at).toLocaleDateString()}</p>
                  <Link className={record.status === 'changes_requested' ? 'cx-button cx-button--signal' : 'cx-button cx-button--ghost'} href={`/account/story/${record.id}`}>{record.status === 'changes_requested' ? 'Review requested changes →' : 'Open story details →'}</Link>
                </article>
              );
            }) : <div className="cx-record"><h2>No private stories yet.</h2><p className="cx-note">A new contribution begins with an Opening Signal and asks for email verification only after the Final Cut and narrow safety check.</p></div>}
          </div>
          <div className="cx-actions"><Link href="/submit" className="cx-button cx-button--signal">Create another story →</Link></div>
        </div>
      </section>
    </div>
  );
}
