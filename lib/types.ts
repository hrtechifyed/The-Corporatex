export const EXPERIENCE_STATUSES = ['draft','awaiting_ai_analysis','awaiting_user_approval','pending_moderation','changes_requested','published','rejected','withdrawn'] as const;
export type ExperienceStatus = typeof EXPERIENCE_STATUSES[number];

export const CONTRIBUTOR_TRANSITIONS: Record<ExperienceStatus, ExperienceStatus[]> = {
  draft: ['awaiting_ai_analysis','withdrawn'],
  awaiting_ai_analysis: ['awaiting_user_approval','draft','withdrawn'],
  awaiting_user_approval: ['awaiting_ai_analysis','pending_moderation','withdrawn'],
  pending_moderation: ['withdrawn'],
  changes_requested: ['awaiting_ai_analysis','pending_moderation','withdrawn'],
  published: ['withdrawn'],
  rejected: [],
  withdrawn: [],
};

export const MODERATOR_TRANSITIONS: Record<ExperienceStatus, ExperienceStatus[]> = {
  ...CONTRIBUTOR_TRANSITIONS,
  pending_moderation: ['published','rejected','changes_requested'],
  published: ['withdrawn'],
};

export function canTransition(from: ExperienceStatus, to: ExperienceStatus, moderator = false) {
  return (moderator ? MODERATOR_TRANSITIONS : CONTRIBUTOR_TRANSITIONS)[from].includes(to);
}

export type Experience = {
  id: string;
  profile_id: string;
  company_id: string | null;
  original_text: string | null;
  approved_headline: string | null;
  approved_summary: string | null;
  language: string;
  broad_function: string | null;
  broad_region: string | null;
  approximate_tenure: string | null;
  work_arrangement: string | null;
  main_reason: string | null;
  would_join_again: string | null;
  status: ExperienceStatus;
  public_slug: string | null;
  ai_analysis: Analysis | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  companies?: { display_name: string; slug: string } | null;
  profiles?: { hrt_id: string } | null;
};

export const SCENES = [
  ['beginning', 'The Beginning', 'What drew you to this role or company in the first place?'],
  ['promise', 'The Promise', 'What were you told, hoping for or expecting before you joined?'],
  ['good_part', 'The Good Part', 'What genuinely worked and deserves to be remembered positively?'],
  ['shift', 'The Shift', 'What changed the experience, if anything changed at all?'],
  ['tipping_point', 'The Tipping Point', 'What ultimately changed your decision about staying or leaving?'],
  ['lesson', 'The Lesson', 'What do you wish you had known earlier, or what should a future candidate ask?'],
  ['who_thrives', 'Who Thrives Here?', 'Who could genuinely do well in this environment—and why?'],
  ['looking_back', 'Looking Back', 'Would you make the same choice again, or return under the right circumstances?'],
] as const;

export type Analysis = {
  suggestedHeadline: string;
  shortSummary: string;
  openingPromise: string;
  realityCheck: string;
  firstPlotTwist: string;
  recurringConflict: string;
  managementArc: string;
  leadershipArc: string;
  workloadAndBoundaries: string;
  growthAndPromotion: string;
  payAndBenefits: string;
  teamAndCulture: string;
  positiveMoments: string;
  finalTrigger: string;
  warningSigns: string[];
  whoMayThrive: string;
  whoMayStruggle: string;
  candidateQuestions: string[];
  wouldReturn: string;
  suggestedLabels: string[];
  possibleIdentifyingDetails: string[];
  possibleAbusiveContent: string[];
  possibleUnsupportedClaims: string[];
  seriousTopic: boolean;
};
