import { NextRequest, NextResponse } from 'next/server';
import { ownedExperience } from '@/lib/auth';
import { sendSafetyReviewAlert } from '@/lib/moderation-alert';
import { reviewSchema, uuidSchema } from '@/lib/schemas';
import { HIGHLIGHT_FIELDS } from '@/lib/review';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    uuidSchema.parse(id);
    const input = reviewSchema.parse(await req.json());
    const { supabase, experience } = await ownedExperience(id);

    if (experience.status !== 'awaiting_user_approval') {
      return NextResponse.json(
        { error: 'Only a reviewed analysis can be submitted' },
        { status: 409 },
      );
    }

    const rows = HIGHLIGHT_FIELDS.flatMap(([key, category], sort) => {
      const content = String(input.analysis[key] || '').trim();
      return content
        ? [{
            experience_id: id,
            category,
            content,
            contributor_approved: true,
            sort_order: sort,
          }]
        : [];
    });

    await supabase.from('experience_highlights').delete().eq('experience_id', id);
    if (rows.length) {
      const stored = await supabase.from('experience_highlights').insert(rows);
      if (stored.error) throw stored.error;
    }

    await supabase.from('experience_labels').delete().eq('experience_id', id);
    if (input.labels.length) {
      const labels = input.labels.map((label) => ({ experience_id: id, label }));
      const stored = await supabase.from('experience_labels').insert(labels);
      if (stored.error) throw stored.error;
    }

    const { error } = await supabase
      .from('experiences')
      .update({
        ai_analysis: input.analysis,
        approved_headline: input.headline,
        approved_summary: input.summary,
        status: 'pending_moderation',
      })
      .eq('id', id);
    if (error) throw error;

    const safetyIndicators = Array.isArray(input.analysis.possibleAbusiveContent)
      ? input.analysis.possibleAbusiveContent.length
      : 0;

    const moderatorAlert = safetyIndicators > 0
      ? await sendSafetyReviewAlert({ submissionId: id, flagCount: safetyIndicators })
      : { status: 'not_required' as const };

    if (moderatorAlert.status === 'failed') {
      console.error('CorporateX safety review email failed', {
        submissionId: id,
        error: moderatorAlert.error,
      });
    }

    return NextResponse.json({
      status: 'pending_moderation',
      moderatorAlert: moderatorAlert.status,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Submission failed' },
      { status: 400 },
    );
  }
}
