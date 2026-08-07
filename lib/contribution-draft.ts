import type { EndingValue } from './endings';
import { SCENES } from './types';

export const CONTRIBUTION_DRAFT_KEY = 'corporatex:contribution:v3';
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type StoryBeatKey = (typeof SCENES)[number][0];
export type ShiftTopic =
  | 'leadership'
  | 'team'
  | 'workload'
  | 'structure'
  | 'compensation'
  | 'technology-ai'
  | 'expectations'
  | 'other';

export type ContributionContext = {
  companyName: string;
  broadRegion: string;
  broadFunction: string;
  approximateTenure: string;
  workArrangement: string;
};

export type FinalCut = {
  headline: string;
  summary: string;
  beats: Partial<Record<StoryBeatKey, string>>;
  technologyFollowUp: string;
};

export type SafetyResult = {
  possibleIdentifyingDetails: string[];
  possibleAbusiveContent: string[];
  seriousTopic: boolean;
  suggestedLabels: string[];
  checkedAt: number;
};

export type ContributionDraft = {
  version: 3;
  draftId: string;
  updatedAt: number;
  ending?: EndingValue;
  context: ContributionContext;
  answers: Partial<Record<StoryBeatKey, string>>;
  shiftTopics: ShiftTopic[];
  technologyFollowUp: string;
  finalCut?: FinalCut;
  safety?: SafetyResult;
};

function emptyContext(): ContributionContext {
  return {
    companyName: '',
    broadRegion: '',
    broadFunction: '',
    approximateTenure: '1–2 years',
    workArrangement: 'Hybrid',
  };
}

export function createContributionDraft(): ContributionDraft {
  return {
    version: 3,
    draftId: typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `draft-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    updatedAt: Date.now(),
    context: emptyContext(),
    answers: {},
    shiftTopics: [],
    technologyFollowUp: '',
  };
}

export function loadContributionDraft(): ContributionDraft {
  if (typeof window === 'undefined') return createContributionDraft();

  try {
    const raw = window.localStorage.getItem(CONTRIBUTION_DRAFT_KEY);
    if (!raw) return createContributionDraft();
    const parsed = JSON.parse(raw) as Partial<ContributionDraft>;
    if (parsed.version !== 3 || !parsed.updatedAt || Date.now() - parsed.updatedAt > DRAFT_TTL_MS) {
      window.localStorage.removeItem(CONTRIBUTION_DRAFT_KEY);
      return createContributionDraft();
    }

    return {
      ...createContributionDraft(),
      ...parsed,
      version: 3,
      draftId: parsed.draftId || createContributionDraft().draftId,
      context: { ...emptyContext(), ...(parsed.context || {}) },
      answers: parsed.answers || {},
      shiftTopics: parsed.shiftTopics || [],
      technologyFollowUp: parsed.technologyFollowUp || '',
    };
  } catch {
    return createContributionDraft();
  }
}

export function saveContributionDraft(draft: ContributionDraft): ContributionDraft {
  const next = { ...draft, updatedAt: Date.now() };
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(CONTRIBUTION_DRAFT_KEY, JSON.stringify(next));
  }
  return next;
}

export function clearContributionDraft() {
  if (typeof window !== 'undefined') window.localStorage.removeItem(CONTRIBUTION_DRAFT_KEY);
}

function compact(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export function buildInitialFinalCut(draft: ContributionDraft): FinalCut {
  const company = compact(draft.context.companyName);
  const functionName = compact(draft.context.broadFunction);
  const headline = functionName && company
    ? `${functionName} experience at ${company}`
    : company
      ? `A workplace experience at ${company}`
      : 'A workplace experience worth sharing';

  const summarySource = [
    draft.answers.beginning,
    draft.answers.good_part,
    draft.answers.shift,
    draft.answers.lesson,
  ]
    .filter(Boolean)
    .map((value) => compact(String(value)))
    .join(' ');

  const summary = (summarySource || 'A contributor-described workplace experience.')
    .slice(0, 1200)
    .trim();

  return {
    headline: headline.slice(0, 160),
    summary: summary.length >= 20 ? summary : `${summary} This is one contributor’s experience.`.slice(0, 1200),
    beats: { ...draft.answers },
    technologyFollowUp: draft.technologyFollowUp,
  };
}

export function draftHasRequiredContext(draft: ContributionDraft) {
  return Boolean(
    draft.ending
    && draft.context.companyName.trim().length >= 2
    && draft.context.broadRegion.trim().length >= 2,
  );
}
