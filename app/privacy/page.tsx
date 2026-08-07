export default function Privacy() {
  return (
    <div className="cx-page">
      <section className="cx-section">
        <div className="cx-shell cx-story-hero-grid">
          <div>
            <p className="cx-kicker">Privacy &amp; Safety</p>
            <h1 className="cx-display">Protected while you <em>speak.</em></h1>
            <p className="cx-lede">Your unfinished contribution stays in your browser while you write. The Final Cut is sent to the CorporateX server only for the safety check before verification, and the story database record is created only after you verify your email and submit.</p>
          </div>
          <div className="cx-signal-visual cx-signal-visual--compact" aria-hidden="true"><span className="cx-signal-visual__ring cx-signal-visual__ring--one" /><span className="cx-signal-visual__ring cx-signal-visual__ring--two" /><span className="cx-signal-visual__core" /><span className="cx-signal-visual__trail" /></div>
        </div>
      </section>

      <section className="cx-section cx-light-section">
        <div className="cx-shell">
          <p className="cx-kicker">Six clear answers</p>
          <h2 className="cx-title">Know what happens to your story.</h2>
          <div className="cx-info-stack">
            <details open><summary>What is stored while I am writing?</summary><p>Before verification, the unfinished contribution is kept in this browser so you can move between scenes without creating an account. It is cleared from browser storage only after the server confirms submission.</p></details>
            <details><summary>What happens during the safety check?</summary><p>The contributor-approved Final Cut is sent to the CorporateX server for a transient safety check. At that point it is processed but not written as a story database record. If the check is clear, you can proceed to final email verification.</p></details>
            <details><summary>What is stored after I submit?</summary><p>Your private account email, broad workplace context, contributor-approved Story Beats, Final Cut and moderation history. Do not submit names, confidential records or information you do not have the right to share.</p></details>
            <details><summary>What becomes public?</summary><p>Only the contributor-approved headline, summary, broad context, Ending, approved Story Beats, themes and anonymous HRT identity. Private email and original drafting data are excluded from the public view.</p></details>
            <details><summary>What does the safety screen check?</summary><p>Direct racial or identity slurs, targeted abusive language, threats or graphic violence, self-harm expressions and basic identifying details such as email addresses, phone numbers and web links.</p></details>
            <details><summary>What does CorporateX not moderate?</summary><p>Employer criticism, uncomfortable opinions, dissatisfaction, praise or a contributor’s decision to leave. One story remains one perspective rather than a verified company-wide fact.</p></details>
            <details><summary>How can a story be changed or withdrawn?</summary><p>Before submission, use Back or Final Cut to change the contribution. After submission, contributors can use their private archive to manage eligible records and can request withdrawal or deletion from the platform operator. Public reports are reviewed in the protected moderator workspace.</p></details>
          </div>
        </div>
      </section>
    </div>
  );
}
