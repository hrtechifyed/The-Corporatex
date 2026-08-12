import Link from 'next/link';
import { ownedExperience } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { endingFor } from '@/lib/endings';
import { SCENES } from '@/lib/types';
import { ChangeRequestEditor } from '@/components/change-request-editor';
import { AccountStoryControls } from '@/components/account-story-controls';

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

export default async function AccountStory({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, experience } = await ownedExperience(id);
  const [{ data: guided }, { data: highlights }, { data: labels }] = await Promise.all([
    supabase.from('guided_answers').select('question_key,answer,sort_order').eq('experience_id', id).order('sort_order'),
    supabase.from('experience_highlights').select('category,content,sort_order').eq('experience_id', id).order('sort_order'),
    supabase.from('experience_labels').select('label').eq('experience_id', id),
  ]);
  const admin = createAdminClient();
  const { data: changeAction } = experience.status === 'changes_requested'
    ? await admin.from('moderation_actions').select('private_reason,created_at').eq('experience_id', id).eq('action', 'request_changes').order('created_at', { ascending: false }).limit(1).maybeSingle()
    : { data: null };

  const answerMap = Object.fromEntries((guided || []).filter((row) => SCENES.some(([key]) => key === row.question_key)).map((row) => [row.question_key, row.answer]));
  const technologyFollowUp = String((guided || []).find((row) => row.question_key === 'shift_technology_followup')?.answer || '');
  const ending = endingFor(experience.main_reason);
  const company = Array.isArray(experience.companies) ? experience.companies[0] : experience.companies;
  const publicHref = experience.status === 'published' && experience.public_slug && company?.slug ? `/experience/${company.slug}/${experience.public_slug}` : '';

  return (
    <div className="cx-page">
      <section className="cx-section">
        <div className="cx-shell">
          <div className="cx-section-heading">
            <div><p className="cx-kicker">Private Signal Archive</p><h1 className="cx-title">Your story.</h1></div>
            <Link className="cx-button cx-button--ghost" href="/account">← My Stories</Link>
          </div>

          <article className="cx-record" style={{ marginTop: '1.5rem' }}>
            <div className="cx-account-action-row"><span className="cx-ending-badge">{ending.title}</span><span className="cx-status-pill">{STATUS_LABELS[experience.status] || 'Private story'}</span></div>
            <h2>{experience.approved_headline || `${company?.display_name || 'Workplace'} private story`}</h2>
            <p>{experience.approved_summary || 'This private record does not have a final summary yet.'}</p>
            <div className="cx-public-preview__meta">
              <span>Company · {company?.display_name || 'Not stated'}</span><span>Role · {experience.broad_function || 'Not stated'}</span><span>Region · {experience.broad_region || 'Not stated'}</span><span>Tenure · {experience.approximate_tenure || 'Not stated'}</span><span>Arrangement · {experience.work_arrangement || 'Not stated'}</span>
            </div>
            {changeAction?.private_reason ? <div className="cx-flow-status cx-flow-status--warning"><strong>Moderator change request</strong><p>{changeAction.private_reason}</p></div> : null}
            {experience.status === 'draft' ? <div className="cx-actions"><Link className="cx-button cx-button--signal" href={`/submit/finish?id=${encodeURIComponent(id)}`}>Complete verified submission →</Link></div> : null}
            {publicHref ? <div className="cx-actions"><Link className="cx-button cx-button--signal" href={publicHref}>View published story →</Link></div> : null}
            <AccountStoryControls id={id} status={experience.status} />
          </article>

          {experience.status === 'changes_requested' ? <ChangeRequestEditor id={id} initialHeadline={experience.approved_headline || ''} initialSummary={experience.approved_summary || ''} initialAnswers={answerMap} technologyFollowUp={technologyFollowUp} /> : (
            <section className="cx-journey-panel" style={{ marginTop: '1.5rem' }}>
              <p className="cx-kicker">Contributor-approved sequence</p>
              <h2>Story Beats retained privately</h2>
              <div className="cx-public-preview__beats">{SCENES.map(([key, title]) => answerMap[key] ? <div className="cx-public-preview__beat" key={key}><strong>{title}</strong><p>{answerMap[key]}</p></div> : null)}</div>
              {technologyFollowUp ? <div className="cx-public-preview__beat"><strong>Technology / AI follow-up</strong><p>{technologyFollowUp}</p></div> : null}
              {highlights?.length ? <details className="cx-info-stack"><summary>Current public-preview highlights</summary>{highlights.map((item) => <p key={`${item.category}-${item.sort_order}`}><strong>{item.category.replaceAll('_', ' ')}</strong><br />{item.content}</p>)}</details> : null}
              {labels?.length ? <div className="cx-public-preview__labels">{labels.map((row) => <span key={row.label}>{row.label}</span>)}</div> : null}
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
