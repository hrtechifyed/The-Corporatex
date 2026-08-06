import 'server-only';
import { GoogleGenAI } from '@google/genai';
import { analysisSchema } from './schemas';

const FIELDS = [
  'suggestedHeadline',
  'shortSummary',
  'openingPromise',
  'realityCheck',
  'firstPlotTwist',
  'recurringConflict',
  'managementArc',
  'leadershipArc',
  'workloadAndBoundaries',
  'growthAndPromotion',
  'payAndBenefits',
  'teamAndCulture',
  'positiveMoments',
  'finalTrigger',
  'warningSigns',
  'whoMayThrive',
  'whoMayStruggle',
  'candidateQuestions',
  'wouldReturn',
  'suggestedLabels',
  'possibleIdentifyingDetails',
  'possibleAbusiveContent',
  'possibleUnsupportedClaims',
  'seriousTopic',
];

export async function analyseStory(source: {
  context: unknown;
  guided: unknown;
  freeText: string | null;
}) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  const prompt = `You are a careful workplace-story editor, not a judge or fact checker. Organise only facts in SOURCE. Never invent, exaggerate, infer illegality, add names, or turn uncertainty into certainty. Preserve balanced positives. Flag possible identifying details, abusive language, unsupported claims, and serious topics. For serious harm use direct neutral language, never entertainment metaphors. Return one JSON object with exactly these camelCase fields: ${FIELDS.join(', ')}. warningSigns, candidateQuestions, suggestedLabels and all possible* fields are arrays of strings; seriousTopic is boolean; all others strings. Use empty strings/arrays where source has no support. SOURCE: ${JSON.stringify(source)}`;

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const text = response.text?.trim();
  if (!text) throw new Error('Gemini returned an empty analysis');

  return analysisSchema.parse(JSON.parse(text));
}
