import type { EndingValue } from './endings';
import { SCENES } from './types';

export const CONTRIBUTION_DRAFT_KEY = 'corporatex:contribution:v3';
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const MIN_SUBSTANTIVE_STORY_CHARS = 60;

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
    approximateTenure: '',
    workArrangement: '',
  };
}

function fallbackUuid() {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) crypto.getRandomValues(bytes);
  else for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function newDraftId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : fallbackUuid();
}

export function createContributionDraft(): ContributionDraft {
  return {
    version: 3,
    draftId: newDraftId(),
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
      draftId: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(parsed.draftId || '') ? String(parsed.draftId) : newDraftId(),
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

export function substantiveStoryLength(beats: Partial<Record<StoryBeatKey, string>>) {
  return Object.values(beats).map((value) => compact(String(value || ''))).join(' ').length;
}

export function hasSubstantiveStory(beats: Partial<Record<StoryBeatKey, string>>) {
  return substantiveStoryLength(beats) >= MIN_SUBSTANTIVE_STORY_CHARS;
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
    && draft.context.broadRegion.trim().length >= 2
    && draft.context.approximateTenure.trim().length > 0
    && draft.context.workArrangement.trim().length > 0,
  );
}
