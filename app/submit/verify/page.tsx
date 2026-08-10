import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requestSubmissionLink } from './actions';

export default async function VerifySubmission({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const q = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/submit/finish');

  return (
    <div className="cx-flow-shell">
      <ol className="cx-flow-progress" aria-label="Contribution journey">
        {['Opening Signal', 'Set the Scene', 'Story Beats', 'Final Cut', 'Submit'].map((label, index) => <li key={label} aria-current={index === 4 ? 'step' : undefined} data-complete={index < 4 ? 'true' : 'false'}><span>{index + 1}</span>{label}</li>)}
      </ol>
      <section className="cx-flow-card cx-flow-card--verify">
        <p className="cx-kicker">Verify &amp; Submit</p>
        <h1 className="cx-title">Save and submit your story.</h1>
        <p className="cx-lede">Your story is complete. Verify your email only now so CorporateX can privately associate this contribution with you. Your email never appears on the public story.</p>
        {q.sent ? (
          <div className="cx-flow-status cx-flow-status--success" role="status">
            <strong>Check your inbox.</strong>
            <p>The verification email is sent by HRTechify · CorporateX. Open the CorporateX link in this browser; after verification, the story will be saved and sent into the private review path.</p>
            <p className="cx-note">Do not clear site data before opening the link; your unfinished contribution is still stored only in this browser.</p>
          </div>
        ) : (
          <form action={requestSubmissionLink} className="cx-flow-verify-form">
            <label className="cx-field"><span>Email address</span><input className="cx-input" required type="email" name="email" autoComplete="email" /></label>
            <p className="cx-note">The one-time verification email will come from the HRTechify mailbox with CorporateX branding.</p>
            {q.error ? <p className="cx-flow-error" role="alert">{q.error}</p> : null}
            <div className="cx-flow-actions"><a className="cx-button cx-button--ghost" href="/submit/final-cut">← Back to Final Cut</a><button className="cx-button cx-button--signal" type="submit">Email my confirmation link →</button></div>
          </form>
        )}
      </section>
    </div>
  );
}
