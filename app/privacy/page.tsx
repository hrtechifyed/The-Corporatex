import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy & Safety',
  description: 'Understand what CorporateX stores, what its automated safety screen checks, and what can become public.',
  alternates: { canonical: '/privacy' },
};

export default function Privacy() {
  return (
    <div className="cx-page">
      <section className="cx-section">
        <div className="cx-shell cx-story-hero-grid">
          <div>
            <p className="cx-kicker">Privacy &amp; Safety</p>
            <h1 className="cx-display">Protected while you <em>speak.</em></h1>
            <p className="cx-lede">Your unfinished contribution stays in your browser while you write. The Final Cut is sent to the CorporateX server for the safety check. When you request the verification email, CorporateX creates a private recoverable handoff so the one-time link can work across browsers or devices. That handoff is not public and does not enter moderation until your email is verified.</p>
          </div>
          <div className="cx-frozen-mini-art" aria-hidden="true" />
        </div>
      </section>

      <section className="cx-section cx-light-section">
        <div className="cx-shell">
          <p className="cx-kicker">Seven clear answers</p>
          <h2 className="cx-title">Know what happens to your story.</h2>
          <div className="cx-info-stack">
            <details open><summary>What is stored while I am writing?</summary><p>Before the verification step, the unfinished contribution is kept in this browser so you can move between scenes without creating an account. Local drafts expire after seven days and can be discarded manually.</p></details>
            <details><summary>What happens during the safety check?</summary><p>The contributor-approved Final Cut is sent to the CorporateX server for a transient safety check. At this point it is processed but not yet saved as a recoverable submission handoff or entered into moderation.</p></details>
            <details><summary>What changes when I request the verification email?</summary><p>CorporateX privately saves the contributor-approved Final Cut and broad workplace context as a recoverable draft associated with the email account used for verification. This allows the one-time verification link to be opened in another browser or device without losing the completed story. It remains private and does not enter moderation until verification succeeds.</p></details>
            <details><summary>What is stored after I submit?</summary><p>Your private account email, broad workplace context, contributor-approved Story Beats, Final Cut and moderation history. Do not submit names, confidential records or information you do not have the right to share.</p></details>
            <details><summary>What becomes public?</summary><p>Only the moderator-reviewed public headline, summary, broad context, Ending, approved Story Beats, themes and anonymous HRT identity. Private email, local drafting data and private moderation notes are excluded from the public view.</p></details>
            <details><summary>What does the automated safety screen check?</summary><p>Basic contact-detail indicators such as email addresses, phone numbers and web links; a narrow list of direct racial or identity slurs; targeted abusive terms; and a narrow set of threat, violent or self-harm expressions. It is not a complete identity detector and does not replace human moderation.</p></details>
            <details><summary>What does CorporateX not score or remove merely for being critical?</summary><p>Employer criticism, uncomfortable opinions, dissatisfaction, praise or a contributor’s decision to leave are not sentiment-scored. One story remains one perspective rather than a verified company-wide fact.</p></details>
            <details><summary>How can a story be changed or withdrawn?</summary><p>Before verification, use Back or Final Cut to change the contribution, or discard the local draft. After submission, contributors can use their private archive for eligible changes and withdrawal controls. Public reports are reviewed in the protected moderator workspace.</p></details>
          </div>
        </div>
      </section>
    </div>
  );
}
