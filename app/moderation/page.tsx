import Link from 'next/link';
import { requireModerator } from '@/lib/auth';
import { endingFor } from '@/lib/endings';
import { ModerationControls } from '@/components/moderation-controls';
import { ReportControls } from '@/components/report-controls';

export default async function Moderation() {
  const { supabase } = await requireModerator();
  const [{ data: records }, { data: reports }] = await Promise.all([
    supabase
      .from('experiences')
      .select('id,status,original_text,approved_headline,approved_summary,ai_analysis,broad_function,broad_region,approximate_tenure,work_arrangement,main_reason,public_slug,profiles(hrt_id),companies(display_name,slug),experience_highlights(category,content,sort_order,contributor_approved),experience_labels(label),moderation_actions(action,private_reason,created_at)')
      .in('status', ['pending_moderation', 'published'])
      .order('updated_at'),
    supabase
      .from('reports')
      .select('id,status,reason,details,created_at,experience_id,experiences(id,approved_headline,public_slug,companies(display_name,slug))')
      .in('status', ['open', 'reviewing'])
      .order('created_at'),
  ]);

  return (
    <div className="cx-page">
      <section className="cx-section">
        <div className="cx-shell">
          <p className="cx-kicker">Protected workspace</p>
          <h1 className="cx-title">Safety Review</h1>
          <p className="cx-lede">Review the exact public version, safety and identity indicators, and community reports. Employer criticism is not a removal reason.</p>

          <section className="cx-journey-panel" style={{ marginTop: '2rem' }} aria-labelledby="report-queue-title">
            <p className="cx-kicker">Community report queue</p>
            <h2 id="report-queue-title">Open reports</h2>
            {reports?.length ? <div className="cx-record-grid" style={{ marginTop: '1rem' }}>{reports.map((report: any) => {
              const experience = Array.isArray(report.experiences) ? report.experiences[0] : report.experiences;
              const company = Array.isArray(experience?.companies) ? experience.companies[0] : experience?.companies;
              const storyHref = experience?.public_slug && company?.slug ? `/experience/${company.slug}/${experience.public_slug}` : '';
              return <article className="cx-record" key={report.id}>
                <span className="cx-status-pill">{report.status}</span>
                <h3>{experience?.approved_headline || 'Reported published story'}</h3>
                <p className="cx-note">{company?.display_name || 'Company'} · {new Date(report.created_at).toLocaleString()}</p>
                <p><strong>Reason:</strong> {report.reason}</p>
                <p style={{ whiteSpace: 'pre-wrap' }}>{report.details}</p>
                {storyHref ? <Link className="cx-button cx-button--ghost" href={storyHref} target="_blank">Open public story ↗</Link> : null}
                <ReportControls id={report.id} status={report.status} />
              </article>;
            })}</div> : <p className="cx-note">No open or reviewing community reports.</p>}
          </section>

          <div className="cx-record-grid" style={{ marginTop: '2rem' }}>
            {records?.length ? records.map((record: any) => {
              const company = Array.isArray(record.companies) ? record.companies[0] : record.companies;
              const profile = Array.isArray(record.profiles) ? record.profiles[0]?.hrt_id : record.profiles?.hrt_id;
              const ending = endingFor(record.main_reason);
              const highlights = [...(record.experience_highlights || [])].sort((a: any, b: any) => a.sort_order - b.sort_order);
              const labels = (record.experience_labels || []).map((row: any) => String(row.label)).filter(Boolean);
              const history = [...(record.moderation_actions || [])].sort((a: any, b: any) => String(b.created_at).localeCompare(String(a.created_at)));
              return (
                <article className="cx-record" key={record.id}>
                  <span className="cx-ending-badge">{record.status.replaceAll('_', ' ')}</span>
                  <h2>{record.approved_headline}</h2>
                  <p className="cx-note">{company?.display_name} · {profile}</p>

                  <section className="cx-public-preview" aria-label="What will be published">
                    <div className="cx-public-preview__header"><p className="cx-kicker">What will be published</p><h3>Exact public story preview</h3></div>
                    <div className="cx-public-preview__body">
                      <span className="cx-ending-badge">{ending.title}</span>
                      <h2>{record.approved_headline}</h2>
                      <p>{record.approved_summary}</p>
                      <div className="cx-public-preview__meta">
                        <span>Company · {company?.display_name || 'Not stated'}</span>
                        <span>Role · {record.broad_function || 'Not stated'}</span>
                        <span>Region · {record.broad_region || 'Not stated'}</span>
                        <span>Tenure · {record.approximate_tenure || 'Not stated'}</span>
                        <span>Arrangement · {record.work_arrangement || 'Not stated'}</span>
                        <span>Contributor · {profile || 'Anonymous'}</span>
                      </div>
                      <div className="cx-public-preview__beats">
                        {highlights.length ? highlights.map((highlight: any) => <div className="cx-public-preview__beat" key={`${highlight.category}-${highlight.sort_order}`}><strong>{String(highlight.category).replaceAll('_', ' ')}</strong><p>{highlight.content}</p></div>) : <p className="cx-note">No public Story Beat highlights were generated. Do not publish until the record is complete.</p>}
                      </div>
                      <div className="cx-public-preview__labels">{labels.map((label: string) => <span key={label}>{label} · {record.status === 'published' ? 'confirmed' : 'pending validation'}</span>)}</div>
                    </div>
                  </section>

                  <details className="cx-info-stack"><summary>Original contributor text / guided record</summary><p style={{ whiteSpace: 'pre-wrap' }}>{record.original_text || 'Guided answers are retained in the protected submission record.'}</p></details>
                  <details className="cx-info-stack"><summary>Automated safety indicators</summary><pre style={{ overflow: 'auto', whiteSpace: 'pre-wrap', fontSize: '.78rem' }}>{JSON.stringify({ identifying: record.ai_analysis?.possibleIdentifyingDetails, safety: record.ai_analysis?.possibleAbusiveContent, unsupported: record.ai_analysis?.possibleUnsupportedClaims, serious: record.ai_analysis?.seriousTopic }, null, 2)}</pre></details>
                  <details className="cx-info-stack"><summary>Moderation audit history</summary>{history.length ? history.map((entry: any, index: number) => <p key={`${entry.created_at}-${index}`}><strong>{String(entry.action).replaceAll('_', ' ')}</strong> · {new Date(entry.created_at).toLocaleString()}<br />{entry.private_reason || 'No private note recorded.'}</p>) : <p>No moderation actions recorded yet.</p>}</details>
                  <ModerationControls id={record.id} status={record.status} initialHeadline={record.approved_headline || ''} initialSummary={record.approved_summary || ''} />
                </article>
              );
            }) : <div className="cx-empty"><h2>No stories are waiting for moderation.</h2><p>The queue will populate after verified contributor submissions.</p></div>}
          </div>
        </div>
      </section>
    </div>
  );
}
