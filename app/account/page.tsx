import Link from 'next/link';
import { requireProfile } from '@/lib/auth';
import { endingFor } from '@/lib/endings';

export default async function Account() {
  const { supabase, profile } = await requireProfile();
  const { data } = await supabase
    .from('experiences')
    .select('id,status,approved_headline,main_reason,created_at,companies(display_name)')
    .eq('profile_id', profile.id)
    .order('updated_at', { ascending: false });

  return (
    <div className="cx-page">
      <section className="cx-section">
        <div className="cx-shell">
          <p className="cx-kicker">Private Signal Archive</p>
          <h1 className="cx-title">Your stories.</h1>
          <p className="cx-lede">Anonymous identity: <strong>{profile.hrt_id}</strong></p>
          <div className="cx-record-grid">
            {data?.length ? data.map((record: any) => {
              const company = Array.isArray(record.companies) ? record.companies[0]?.display_name : record.companies?.display_name;
              const ending = endingFor(record.main_reason);
              const editable = ['draft', 'changes_requested', 'awaiting_ai_analysis', 'awaiting_user_approval'].includes(record.status);
              const href = record.status === 'awaiting_user_approval'
                ? `/submit/${record.id}/review`
                : record.status === 'awaiting_ai_analysis'
                  ? `/submit/${record.id}/analysis`
                  : `/submit/${record.id}/guided`;
              return (
                <article className="cx-record" key={record.id}>
                  <span className="cx-ending-badge">{ending.title}</span>
                  <h2>{record.approved_headline || `${company || 'Company'} private story`}</h2>
                  <p className="cx-note">Status: {record.status.replaceAll('_', ' ')}</p>
                  {editable ? <Link className="cx-button cx-button--ghost" href={href}>Continue this saved story →</Link> : <span className="cx-note">This record is no longer editable from the contributor journey.</span>}
                </article>
              );
            }) : <div className="cx-record"><h2>No private stories yet.</h2><p className="cx-note">A new contribution begins with an Opening Signal and asks for email verification only at the final submission step.</p></div>}
          </div>
          <div className="cx-actions"><Link href="/submit" className="cx-button cx-button--signal">Create another story →</Link></div>
        </div>
      </section>
    </div>
  );
}
