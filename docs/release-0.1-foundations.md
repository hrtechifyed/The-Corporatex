# The Corporate Ex — Release 0.1 Foundations

Related issues: #8, #9

## Purpose

Release 0.1 proves one product loop:

> Anonymous contributor → structured exit story → contributor approval → human moderation → useful employer insight.

This document is the contract for the controlled alpha. Database rules, API handlers, UI states, moderation tools and tests must follow it.

## Release principles

1. **The contributor owns the meaning.** AI may organise or flag content but must not invent, intensify or decide what is true.
2. **Nothing publishes automatically.** Contributor approval sends a story to moderation; it does not publish it.
3. **Only a moderator may publish or unpublish.** Role authority must be enforced server-side and in the database.
4. **Private data stays structurally separate from public data.** Public queries must never expose emails, private drafts, source text, moderation notes or internal flags.
5. **One story is one perspective.** A published story is not a verified conclusion about an entire employer.
6. **Verification is deferred.** Release 0.1 must not display “verified employee” or “verified ex-employee” labels.

## Roles

| Role | Allowed capabilities |
| --- | --- |
| `anonymous` | Browse published stories and submit a safety/privacy report. |
| `contributor` | Create, edit and view their own private drafts; review AI suggestions; approve wording; submit for moderation; respond to change requests; request withdrawal or deletion. |
| `moderator` | Review submitted stories and private source material; request changes; reject; publish; unpublish; record private reasons and safety notes. |

Role changes must never be available through a public application endpoint.

## Story lifecycle

| Status | Meaning | Who may enter it |
| --- | --- | --- |
| `draft` | Private, editable contributor work. | Contributor; system after a recoverable failure. |
| `ai_processing` | Optional AI organisation is running. | Authenticated server action for the owner. |
| `awaiting_user_approval` | AI-organised version is ready for contributor review. | Server after validated AI output. |
| `pending_moderation` | Contributor approved the exact wording and submitted it. | Contributor only. |
| `changes_requested` | Moderator requires revisions before another review. | Moderator only. |
| `published` | Public story with a stable slug and publication date. | Moderator only. |
| `rejected` | Submission will not be published in its current form. | Moderator only. |
| `withdrawn` | Contributor requested removal or stopped the process. | Contributor request fulfilled by authorised workflow. |
| `unpublished` | A previously public story was removed by moderation. | Moderator only. |

### Allowed transitions

- `draft` → `ai_processing`
- `draft` → `pending_moderation` when AI is skipped and the contributor approves the submitted wording
- `ai_processing` → `awaiting_user_approval`
- `ai_processing` → `draft` on provider, validation or persistence failure
- `awaiting_user_approval` → `draft` when the contributor continues editing
- `awaiting_user_approval` → `pending_moderation`
- `pending_moderation` → `changes_requested`
- `pending_moderation` → `published`
- `pending_moderation` → `rejected`
- `changes_requested` → `draft`
- `changes_requested` → `pending_moderation` after contributor resubmission
- `published` → `unpublished`
- Any contributor-owned non-public state → `withdrawn`
- `published` → `withdrawn` only through an authorised withdrawal workflow that also removes public access

All other transitions must fail.

## Data classification

### Always private

- Authentication email and provider identifiers
- Contributor account metadata
- Original source text and unapproved drafts
- AI prompts, raw provider responses and internal validation details
- Moderator identity, private notes and decision reasons
- Safety flags, abuse signals and report investigation details
- Withdrawal/deletion request correspondence
- IP addresses or rate-limit identifiers, where collected

### Conditionally publishable after contributor approval and moderation

- Employer name
- Broad job function
- Seniority band
- Country or broad region
- Work arrangement
- Employment type
- Approximate tenure
- Exit year
- Primary and secondary exit reasons
- Story headline, summary and approved story sections
- “Would consider returning” response
- AI/automation impact response

### Always public on a published story

- Anonymous contributor ID
- Stable story slug
- Publication date
- “Contributor approved” and “Human moderated” labels
- Perspective disclaimer

Public data access should use a dedicated view or narrowly selected query rather than exposing the full private experience row.

## Story context model

### Required context

- Employer name
- Broad job function
- Country or broad region
- Approximate tenure
- Work arrangement
- Exit year
- Primary exit reason

### Optional context

- Seniority band
- Employment type
- Approximate employer-size band
- Secondary exit reasons
- Whether the contributor would consider returning
- AI/automation impact category

### Identification-risk limits

Do not publish exact team names, manager names, client names, precise office locations, exact start/end dates, unique project names or unusually specific job titles without moderation confirming that the detail is necessary and safe.

## Exit-reason taxonomy

### Primary reason — single select

- Compensation
- Career growth
- Manager / leadership
- Work culture
- Workplace harassment
- Layoff / restructuring
- Role change
- Retirement
- Location / relocation constraints
- Personal reasons
- Work-life balance / burnout
- Health / wellbeing
- Better opportunity
- Job security
- Values mismatch
- Learning / skill stagnation
- AI / automation impact
- Other

### Contributing reasons — multi-select

- Compensation
- Career growth
- Manager
- Team conflict
- Leadership trust
- Workload
- Burnout
- Lack of recognition
- Toxic culture
- Harassment / discrimination
- Performance pressure
- Location / commute
- Remote / hybrid mismatch
- Role drift
- Lack of clarity
- Layoff fear
- Personal / family situation
- Retirement planning
- Health reasons
- AI-driven role pressure
- Other

Custom “Other” entries remain private until moderation confirms that they are safe and suitably broad for publication.

## Story beats

### Required

1. **The opening pull — What drew you in?**
2. **The shift — When did the story turn?**
3. **The point of no return — Why did leaving become necessary?**
4. **The question to ask — What should a future candidate investigate?**

### Optional

- The promise — What did you expect?
- The bright part — What genuinely worked?
- The right-fit caveat — Could someone still thrive there?
- The AI chapter — Did AI, automation or productivity expectations change the work?

A contributor may write a sentence or a longer section. Required fields need meaningful content but should not enforce an artificially high word count.

## AI boundaries

AI may:

- organise contributor-supplied text into the story structure;
- reduce repetition;
- suggest neutral wording;
- identify possible personal or confidential information;
- create a summary based only on supplied content;
- identify incomplete sections.

AI must not:

- invent events or quotations;
- convert uncertainty into fact;
- intensify accusations;
- determine truth or legal liability;
- create an employer rating or verdict;
- decide whether a story should publish;
- receive the contributor email or unrelated account data.

The original contributor text must survive every AI failure.

## Moderation rules

A moderator may publish when the story:

- focuses on the contributor’s own experience;
- removes personal identifiers and confidential information;
- distinguishes observation, recollection and interpretation;
- contains enough context to help a reader;
- avoids threats, harassment, hate, doxxing and discriminatory abuse;
- does not present unsupported allegations as proven facts.

Every `changes_requested`, `rejected`, `published`, `unpublished` or withdrawal-completion action must record a private reason.

Moderator edits that change meaning require contributor confirmation. Pure redaction or formatting changes may be handled under a documented minimal-edit rule, but the final public version must remain visible to the contributor.

## Contributor control

- Contributors can save and return to private drafts.
- Contributors approve the exact version submitted for moderation.
- Contributors can respond to requested changes.
- Contributors can request correction, withdrawal or deletion.
- Editing a published story creates a private revision and returns it to moderation; the existing public version remains unchanged until the revision is approved, unless safety requires immediate unpublishing.

## Withdrawal and deletion

### Withdrawal

Withdrawal removes public access and stops active moderation. A minimal private audit record may be retained for safety, abuse prevention and legal accountability, subject to the published retention policy.

### Deletion

Deletion should remove contributor-controlled content and direct account links where legally and operationally permissible. Security logs, aggregate metrics and irreversible backups may age out according to a documented retention schedule rather than being removed instantly.

The public policy must state the expected response time and any limited retention exceptions.

## Logging and operational boundaries

- Never log story bodies, AI prompts or raw AI responses.
- Log only request identifiers, status codes, timing, model/version metadata and privacy-safe error categories.
- Service-role credentials and AI keys remain server-only.
- Rate-limit sign-in, draft creation, analysis, submission and reporting endpoints.
- Provide a documented way to disable new submissions while leaving published stories readable.
- Maintain a monitored privacy/safety contact: `hrtechifyed@gmail.com`.

## Public story disclaimer

Every published story must display:

> This is one contributor’s experience and perspective. It is not an independently verified conclusion about the entire organisation.

Until employee verification exists, public badges are limited to:

- Anonymous contributor
- Contributor approved
- Human moderated

## Minimum test matrix

### Contributor isolation

- Contributor A cannot read, update or delete Contributor B’s drafts or source text.
- A contributor cannot set their own role.
- A contributor cannot set a story to `published`, `unpublished` or `rejected`.

### Public isolation

- Anonymous users can read only `published` stories through the public projection.
- Public queries never return email, source text, AI payloads, internal flags or moderation notes.
- Unpublished, withdrawn and deleted stories are not publicly accessible by their former slug.

### Moderator authority

- Moderators can review pending stories and record decisions.
- Publishing creates a stable slug and publication timestamp exactly once.
- Unpublishing removes public access without destroying the private audit trail.

### Lifecycle integrity

- Invalid status transitions fail.
- AI failure returns the story to `draft` without losing source content.
- Contributor approval produces `pending_moderation`, never `published`.
- Editing a published story cannot silently overwrite the public version.

### Safety operations

- Reports are private and not visible on public story queries.
- Withdrawal and deletion requests are auditable.
- New submissions can be disabled without taking published reading offline.

## Phase 1 completion gate

Phase 1 is complete only when:

- the schema and domain code enforce this lifecycle;
- public and private data are separated in database access;
- moderation authority is enforced server-side and by database policy;
- required and optional fields match this specification;
- tests cover the minimum matrix above;
- privacy, withdrawal, deletion and incident procedures are reflected in public policy and operator documentation.

## Deferred to a later trust phase

- Work-email verification
- Employment-document review
- LinkedIn/manual employment cross-checks
- Verified employee/ex-employee badges
- Coordinated-submission and identity-fraud detection beyond basic abuse controls
