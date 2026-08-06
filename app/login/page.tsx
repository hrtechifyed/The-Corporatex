import { login } from './actions';
import { CareerJarvis } from '@/components/career-jarvis';

export default async function Login({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const q = await searchParams;
  return (
    <div className="cx-page">
      <section className="cx-system-shell">
        <CareerJarvis compact pose={q.sent ? 'acknowledging' : 'protecting'} dialogue={q.sent ? 'Your private entrance is on its way.' : 'Your email is used only for your private account. It never appears on a public story.'} />
        <p className="cx-kicker">Private entrance</p>
        <h1 className="cx-title">Continue without a password.</h1>
        {q.sent ? (
          <div role="status" className="cx-system-card"><h2>Check your inbox.</h2><p className="cx-note">The magic link signs you in and returns you to your saved journey.</p></div>
        ) : (
          <form action={login} className="cx-system-card">
            <label className="cx-field"><span>Email address</span><input className="cx-input" required type="email" name="email" autoComplete="email" /></label>
            <input type="hidden" name="next" value={q.next || '/submit'} />
            {q.error ? <p role="alert" className="cx-note" style={{ color: 'var(--cx-danger)' }}>{q.error}</p> : null}
            <div className="cx-actions"><button className="cx-button cx-button--signal" type="submit">Email my private link →</button></div>
          </form>
        )}
      </section>
    </div>
  );
}
