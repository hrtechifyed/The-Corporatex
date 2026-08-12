import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SubmissionVerificationForm } from '@/components/submission-verification-form';

export default async function VerifySubmission({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const q = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/submit/finish');

  return (
    <div className="cx-flow-shell">
      <ol className="cx-flow-progress" aria-label="Contribution journey">
        {['Opening Signal', 'Setting the Scene', 'Story Beats', 'Final Cut', 'Submit'].map((label, index) => <li key={label} aria-current={index === 4 ? 'step' : undefined} data-complete={index < 4 ? 'true' : 'false'}><span>{index + 1}</span>{label}</li>)}
      </ol>
      <section className="cx-flow-card cx-flow-card--verify">
        <p className="cx-kicker">Verify &amp; Submit</p>
        <h1 className="cx-title">Save and submit your story.</h1>
        <p className="cx-lede">Your story is complete. CorporateX creates a private recoverable handoff only when you request this verification email, then submits it into private review after the email is verified. Your email never appears on the public story.</p>
        <SubmissionVerificationForm sent={Boolean(q.sent)} serverError={q.error || ''} />
      </section>
    </div>
  );
}
