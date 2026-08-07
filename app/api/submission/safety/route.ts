import { NextResponse } from 'next/server';
import { contributionSubmissionSchema } from '@/lib/schemas';
import { analyseStory } from '@/lib/story-analysis';

export async function POST(req: Request) {
  try {
    const input = contributionSubmissionSchema.parse(await req.json());
    const guided = Object.entries(input.finalCut.beats).map(([question_key, answer], index) => ({
      question_key,
      answer,
      sort_order: index * 10,
    }));
    if (input.finalCut.technologyFollowUp.trim()) {
      guided.push({ question_key: 'shift_technology_followup', answer: input.finalCut.technologyFollowUp, sort_order: 31 });
    }

    const analysis = await analyseStory({
      context: input.context,
      guided,
      freeText: `${input.finalCut.headline}\n${input.finalCut.summary}`,
    });

    return NextResponse.json({
      possibleIdentifyingDetails: analysis.possibleIdentifyingDetails,
      possibleAbusiveContent: analysis.possibleAbusiveContent,
      seriousTopic: analysis.seriousTopic,
      suggestedLabels: analysis.suggestedLabels,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Safety check failed' }, { status: 400 });
  }
}
