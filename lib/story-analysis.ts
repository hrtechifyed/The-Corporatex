import 'server-only';
import { analysisSchema } from './schemas';

type StorySource = {
  context: unknown;
  guided: unknown;
  freeText: string | null;
};

type GuidedAnswer = {
  key: string;
  answer: string;
  sortOrder: number;
};

type SafetyRule = {
  label: string;
  pattern: RegExp;
  serious: boolean;
};

const SAFETY_RULES: SafetyRule[] = [
  {
    label: 'Possible direct racial or identity-based slur',
    pattern: /\b(?:nigg(?:er|a)|kike|chink|paki|spic|gook|faggot|tranny)\b/i,
    serious: false,
  },
  {
    label: 'Possible abusive slang or targeted personal attack',
    pattern: /\b(?:idiot|moron|retard(?:ed)?|stupid|bastard|asshole|bitch|whore)\b/i,
    serious: false,
  },
  {
    label: 'Possible threat or violent expression',
    pattern: /\b(?:kill(?:ed|ing)?|murder(?:ed|ing)?|shoot(?:ing)?|stab(?:bed|bing)?|beat\s+(?:him|her|them|you)\s+up|physical(?:ly)?\s+attack(?:ed|ing)?|threaten(?:ed|ing)?|bomb)\b/i,
    serious: true,
  },
  {
    label: 'Possible self-harm expression',
    pattern: /\b(?:suicid(?:e|al)|self[-\s]?harm|kill\s+myself|end\s+my\s+life|hurt\s+myself)\b/i,
    serious: true,
  },
];

const LABEL_RULES: Array<[string, RegExp]> = [
  ['Leadership', /\b(?:manager|management|leader|leadership|boss)\b/i],
  ['Workload', /\b(?:workload|overtime|burnout|long hours|deadline)\b/i],
  ['Growth', /\b(?:promotion|growth|career|learning|development)\b/i],
  ['Compensation', /\b(?:pay|salary|compensation|bonus|benefits)\b/i],
  ['Wellbeing', /\b(?:wellbeing|well-being|stress|mental health|burnout)\b/i],
  ['Culture', /\b(?:culture|team|colleague|collaboration)\b/i],
  ['Change', /\b(?:restructure|reorganisation|reorganization|layoff|merger|change)\b/i],
  ['AI', /\b(?:AI|automation|artificial intelligence|machine learning)\b/i],
];

function normalize(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function truncate(value: string, maximum: number): string {
  const normalized = normalize(value);
  if (normalized.length <= maximum) return normalized;
  return `${normalized.slice(0, maximum - 1).trimEnd()}…`;
}

function collectStrings(value: unknown, output: string[]): void {
  if (typeof value === 'string') {
    const normalized = normalize(value);
    if (normalized) output.push(normalized);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, output));
    return;
  }
  if (value && typeof value === 'object') {
    Object.values(value as Record<string, unknown>).forEach((item) => collectStrings(item, output));
  }
}

function guidedAnswers(value: unknown): GuidedAnswer[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      const answer = typeof row.answer === 'string' ? normalize(row.answer) : '';
      const rawOrder = row.sort_order ?? row.sortOrder;
      const sortOrder = typeof rawOrder === 'number' && Number.isFinite(rawOrder) ? rawOrder : index;
      const rawKey = row.question_key ?? row.questionKey;
      const key = typeof rawKey === 'string' ? rawKey : `beat_${index}`;
      return answer ? { key, answer, sortOrder } : null;
    })
    .filter((item): item is GuidedAnswer => item !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function broadFunction(context: unknown): string {
  if (!context || typeof context !== 'object') return '';
  const value = (context as Record<string, unknown>).broadFunction;
  return typeof value === 'string' ? truncate(value, 60) : '';
}

function identifyingIndicators(text: string): string[] {
  const indicators: string[] = [];
  if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text)) indicators.push('Possible email address');
  if (/(?:\+?\d[\d\s().-]{7,}\d)/.test(text)) indicators.push('Possible phone number');
  if (/\b(?:https?:\/\/|www\.)\S+/i.test(text)) indicators.push('Possible web address');
  return indicators;
}

export async function analyseStory(source: StorySource) {
  const answers = guidedAnswers(source.guided);
  const byKey = new Map(answers.map((item) => [item.key, item.answer]));
  const collected: string[] = [];
  collectStrings(source.context, collected);
  collectStrings(source.guided, collected);
  collectStrings(source.freeText, collected);
  const storyText = normalize(collected.join(' '));

  const matchedSafetyRules = SAFETY_RULES.filter(({ pattern }) => pattern.test(storyText));
  const suggestedLabels = LABEL_RULES
    .filter(([, pattern]) => pattern.test(storyText))
    .map(([label]) => label)
    .slice(0, 12);

  const role = broadFunction(source.context);
  const summary = truncate(
    source.freeText || answers.map(({ answer }) => answer).join(' ') || 'A contributor-described workplace experience.',
    1200,
  );
  const shift = byKey.get('shift') || '';
  const technologyFollowUp = byKey.get('shift_technology_followup') || '';
  const shiftWithOptionalTechnology = [shift, technologyFollowUp].filter(Boolean).join('\n\n');
  const lesson = byKey.get('lesson') || '';

  return analysisSchema.parse({
    suggestedHeadline: role ? truncate(`A ${role} workplace experience`, 160) : 'A workplace experience worth examining',
    shortSummary: summary,
    openingPromise: truncate(byKey.get('beginning') || answers[0]?.answer || '', 12000),
    realityCheck: truncate(byKey.get('promise') || answers[1]?.answer || '', 12000),
    firstPlotTwist: truncate(shiftWithOptionalTechnology || answers[3]?.answer || '', 12000),
    recurringConflict: '',
    managementArc: '',
    leadershipArc: '',
    workloadAndBoundaries: '',
    growthAndPromotion: '',
    payAndBenefits: '',
    teamAndCulture: '',
    positiveMoments: truncate(byKey.get('good_part') || answers[2]?.answer || '', 12000),
    finalTrigger: truncate(byKey.get('tipping_point') || answers[4]?.answer || '', 12000),
    warningSigns: [],
    whoMayThrive: truncate(byKey.get('who_thrives') || '', 12000),
    whoMayStruggle: '',
    candidateQuestions: lesson ? [truncate(lesson, 300)] : [],
    wouldReturn: truncate(byKey.get('looking_back') || '', 1200),
    suggestedLabels,
    possibleIdentifyingDetails: identifyingIndicators(storyText),
    possibleAbusiveContent: matchedSafetyRules.map(({ label }) => label),
    possibleUnsupportedClaims: [],
    seriousTopic: matchedSafetyRules.some(({ serious }) => serious),
  });
}
