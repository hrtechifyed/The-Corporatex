import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireModerator } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { uuidSchema } from '@/lib/schemas';
import { slugify } from '@/lib/slug';
import { canTransition, type ExperienceStatus } from '@/lib/types';
import { getSiteOrigin } from '@/lib/site-origin';
import { sendModerationOutcomeEmail, type ModerationOutcome } from '@/lib/moderation-email';

const schema = z.object({
  action: z.enum(['edit', 'publish', 'reject', 'request_changes', 'unpublish']),
  privateReason: z.string().max(4000),
  headline: z.string().min(3).max(160),
  summary: z.string().min(20).max(1200),
  publicPreviewReviewed: z.boolean().default(false),
});

const targets = { publish: 'published', reject: 'rejected', request_changes: 'changes_requested', unpublish: 'withdrawn' } as const;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    uuidSchema.parse(id);
    const input = schema.parse(await req.json());
    const { supabase, profile } = await requireModerator();
    const { data: experience, error } = await supabase
      .from('experiences')
      .select('status,approved_headline,public_slug,profile_id,companies(slug)')
      .eq('id', id)
      .single();
    if (error) throw error;

    if (input.action === 'edit') {
      const edited = await supabase.from('experiences').update({ approved_headline: input.headline, approved_summary: input.summary }).eq('id', id);
      if (edited.error) throw edited.error;
      const audit = await supabase.from('moderation_actions').insert({ experience_id: id, moderator_id: profile.id, action: 'edit', private_reason: input.privateReason });
      if (audit.error) throw audit.error;
      return NextResponse.json({ saved: true });
    }

    if (input.action === 'publish' && !input.publicPreviewReviewed) {
      return NextResponse.json({ error: 'Review and confirm the exact public preview before publication.' }, { status: 422 });
    }
    if (['reject', 'request_changes', 'unpublish'].includes(input.action) && input.privateReason.trim().length < 3) {
      return NextResponse.json({ error: 'Add a moderation reason before taking this action.' }, { status: 422 });
    }

    const target = targets[input.action];
    if (!canTransition(experience.status as ExperienceStatus, target, true)) {
      return NextResponse.json({ error: 'Invalid moderation status transition' }, { status: 409 });
    }

    let publicSlug = experience.public_slug;
    if (target === 'published' && !publicSlug) publicSlug = `${slugify(input.headline)}-${id.slice(0, 8)}`;
    const patch: Record<string, unknown> = { status: target, approved_headline: input.headline, approved_summary: input.summary };
    if (target === 'published') Object.assign(patch, { public_slug: publicSlug, published_at: new Date().toISOString() });
    const updated = await supabase.from('experiences').update(patch).eq('id', id);
    if (updated.error) throw updated.error;

    const action = await supabase.from('moderation_actions').insert({ experience_id: id, moderator_id: profile.id, action: input.action, private_reason: input.privateReason });
    if (action.error) throw action.error;

    const admin = createAdminClient();
    const { data: contributor } = await admin.from('profiles').select('private_email').eq('id', experience.profile_id).maybeSingle();
    let notification: 'sent' | 'failed' | 'not_configured' | 'skipped' = 'skipped';
    if (contributor?.private_email) {
      const origin = await getSiteOrigin();
      const companies = experience.companies as unknown as { slug?: string } | Array<{ slug?: string }> | null;
      const companySlug = Array.isArray(companies) ? companies[0]?.slug : companies?.slug;
      const publicUrl = input.action === 'publish' && companySlug && publicSlug ? new URL(`/experience/${companySlug}/${publicSlug}`, origin).toString() : undefined;
      const result = await sendModerationOutcomeEmail({
        to: contributor.private_email,
        action: input.action as ModerationOutcome,
        headline: input.headline,
        privateReason: input.privateReason,
        accountUrl: new URL('/account', origin).toString(),
        publicUrl,
      });
      notification = result.status;
    }

    return NextResponse.json({ status: target, publicSlug, notification });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Moderation failed' }, { status: 400 });
  }
}
