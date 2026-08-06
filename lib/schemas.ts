import { z } from 'zod';

const text = z.string().max(12000);
export const uuidSchema = z.string().uuid();
export const endingSchema = z.enum(['Break Free', 'Next Act', 'Mixed Ending', 'Pass the Torch']);
export const draftSchema = z.object({
  companyName: z.string().trim().min(2).max(120),
  broadFunction: z.string().trim().max(80),
  broadRegion: z.string().trim().min(2).max(80),
  approximateTenure: z.string().max(50),
  workArrangement: z.string().max(50),
  mainReason: endingSchema,
});
export const answerSchema = z.object({ questionKey: z.string().min(2).max(60), answer: text, sortOrder: z.number().int().min(0).max(20) });
export const directorSchema = z.object({ originalText: text });
export const analysisSchema = z.object({
  suggestedHeadline: z.string().max(160),
  shortSummary: text,
  openingPromise: text,
  realityCheck: text,
  firstPlotTwist: text,
  recurringConflict: text,
  managementArc: text,
  leadershipArc: text,
  workloadAndBoundaries: text,
  growthAndPromotion: text,
  payAndBenefits: text,
  teamAndCulture: text,
  positiveMoments: text,
  finalTrigger: text,
  warningSigns: z.array(z.string().max(300)).max(12),
  whoMayThrive: text,
  whoMayStruggle: text,
  candidateQuestions: z.array(z.string().max(300)).max(12),
  wouldReturn: z.string().max(80),
  suggestedLabels: z.array(z.string().max(40)).max(12),
  possibleIdentifyingDetails: z.array(z.string().max(300)).max(20),
  possibleAbusiveContent: z.array(z.string().max(300)).max(20),
  possibleUnsupportedClaims: z.array(z.string().max(300)).max(20),
  seriousTopic: z.boolean(),
});
export const reviewSchema = z.object({
  analysis: analysisSchema,
  headline: z.string().min(3).max(160),
  summary: z.string().min(20).max(1200),
  labels: z.array(z.string().max(40)).max(12),
});
