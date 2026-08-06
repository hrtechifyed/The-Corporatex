import { requireModerator } from '@/lib/auth';
import { ModerationControls } from '@/components/moderation-controls';

export default async function Moderation() {
  const { supabase } = await requireModerator();
  const { data } = await supabase
    .from('experiences')
    .select('id,status,original_text,approved_headline,approved_summary,ai_analysis,profiles(hrt_id),companies(display_name)')
    .in('status', ['pending_moderation', 'published'])
    .order('updated_at');

  return (
    <div className="cx-page">
      <section className="cx-section">
        <div className="cx-shell">
          <p className="cx-kicker">Protected workspace</p>
          <h1 className="cx-title">Safety Review</h1>
          <p className="cx-lede">Review safety and identity indicators. Employer criticism is not a removal reason.</p>
          <div className="cx-record-grid">
            {data?.map((record: any) => {
              const company = Array.isArray(record.companies) ? record.companies[0]?.display_name : record.companies?.display_name;
              const profile = Array.isArray(record.profiles) ? record.profiles[0]?.hrt_id : record.profiles?.hrt_id;
              return (
                <article className="cx-record" key={record.id}>
                  <span className="cx-ending-badge">{record.status.replaceAll('_', ' ')}</span>
                  <h2>{record.approved_headline}</h2>
                  <p className="cx-note">{company} · {profile}</p>
                  <details className="cx-info-stack"><summary>Original contributor text</summary><p style={{ whiteSpace: 'pre-wrap' }}>{record.original_text || 'Guided answers are retained in the protected submission record.'}</p></details>
                  <details className="cx-info-stack"><summary>Contributor-approved summary</summary><p>{record.approved_summary}</p></details>
                  <details className="cx-info-stack"><summary>Local safety indicators</summary><pre style={{ overflow: 'auto', whiteSpace: 'pre-wrap', fontSize: '.78rem' }}>{JSON.stringify({ identifying: record.ai_analysis?.possibleIdentifyingDetails, safety: record.ai_analysis?.possibleAbusiveContent, unsupported: record.ai_analysis?.possibleUnsupportedClaims, serious: record.ai_analysis?.seriousTopic }, null, 2)}</pre></details>
                  <ModerationControls id={record.id} status={record.status} initialHeadline={record.approved_headline || ''} initialSummary={record.approved_summary || ''} />
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
