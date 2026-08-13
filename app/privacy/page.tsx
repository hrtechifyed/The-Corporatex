import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy & Safety',
  description: 'How CorporateX handles account data, My Space, submissions, moderated Q&A, privacy and safety.',
  alternates: { canonical: '/privacy' },
};

export default function Privacy() {
  return (
    <div className="cx-page">
      <section className="cx-section">
        <div className="cx-shell cx-story-hero-grid">
          <div>
            <p className="cx-kicker">Privacy &amp; Safety</p>
            <h1 className="cx-display">Private where it should be. <em>Public only after review.</em></h1>
            <p className="cx-lede">CorporateX separates account identity, private reading activity and contributor records from the moderated workplace content that can become public.</p>
          </div>
          <div className="cx-frozen-mini-art" aria-hidden="true" />
        </div>
      </section>

      <section className="cx-section cx-light-section">
        <div className="cx-shell">
          <p className="cx-kicker">Current product data map</p>
          <h2 className="cx-title">Know what is private, what is stored and what can become public.</h2>
          <div className="cx-info-stack">
            <details open><summary>What is my email used for?</summary><p>Email-based authentication protects My Space, saving/following, follow-up questions and contributor submissions. Your email is not displayed with a published story, save, follow, question or response.</p></details>
            <details><summary>What does My Space store?</summary><p>Saved and Following store your private account identifier, the relevant published story identifier and a timestamp so the relationship can be restored to your account. These relationships are not exposed to other readers or included in public story output.</p></details>
            <details><summary>What is stored for a submission?</summary><p>CorporateX stores contributor-approved Story Beats, broad workplace context, moderation status and related private submission records after an authenticated submission is created. New submissions enter moderation rather than publishing automatically.</p></details>
            <details><summary>How does moderated follow-up Q&amp;A work?</summary><p>Questions and contributor responses are privately associated with the authenticated participants and enter moderation before publication. Public Q&amp;A exposes only approved question/response text and public timestamps, not private participant account identifiers.</p></details>
            <details><summary>What becomes public?</summary><p>Only moderator-approved public story fields and approved Q&amp;A become publicly readable. Private email, Saved/Following relationships, private submission records and moderator-only data are excluded from public views.</p></details>
            <details><summary>What does the automated safety screen check?</summary><p>Basic contact-detail indicators such as email addresses, phone numbers and web links, plus a narrow set of direct slurs, targeted abusive terms, threats, violent expressions and self-harm expressions. It is not a complete identity detector, does not establish truth and does not replace human moderation.</p></details>
            <details><summary>Where does CorporateX run?</summary><p>GitHub Pages is the normal user-facing frontend. Supabase provides authentication, database storage and trusted backend functions. Authentication emails are delivered through HRTechify's configured email provider. Render is a testing/staging environment rather than the normal production destination.</p></details>
            <details><summary>How long is data kept?</summary><p>CorporateX does not currently publish an automatic retention period for account records, Saved/Following relationships, submissions or moderated Q&amp;A. Records may remain while needed to operate the service, preserve moderation history, respond to safety issues or support an active account.</p></details>
            <details><summary>How can I change or remove data?</summary><p>Saved and Following can be reversed through the product. For account-data review, correction, removal or contribution-withdrawal requests not available directly in the interface, contact hrtechifyed@gmail.com. Requests may require verification that you control the relevant account.</p></details>
          </div>
        </div>
      </section>
    </div>
  );
}
