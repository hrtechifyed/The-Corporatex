import { login } from './actions';

export default async function Login({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const q = await searchParams;
  return (
    <div className="cx-page">
      <section className="cx-system-shell">
        <p className="cx-kicker">Private entrance</p>
        <h1 className="cx-title">Continue without a password.</h1>
        <p className="cx-lede">Use this entrance to return to your private CorporateX archive. Story submission asks for verification only after the Final Cut and safety check.</p>
        {q.sent ? (
          <div role="status" className="cx-system-card"><h2>Check your inbox.</h2><p className="cx-note">The magic link signs you in and returns you to your private account.</p></div>
        ) : (
          <form action={login} className="cx-system-card">
            <label className="cx-field"><span>Email address</span><input className="cx-input" required type="email" name="email" autoComplete="email" /></label>
            <input type="hidden" name="next" value={q.next || '/account'} />
            {q.error ? <p role="alert" className="cx-note" style={{ color: 'var(--cx-danger)' }}>{q.error}</p> : null}
            <div className="cx-actions"><button className="cx-button cx-button--signal" type="submit">Email my private link →</button></div>
          </form>
        )}
      </section>
    </div>
  );
}
