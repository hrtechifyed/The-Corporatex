import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ownedExperience } from '@/lib/auth';
import { uuidSchema } from '@/lib/schemas';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    uuidSchema.parse(id);
    const { experience, profile } = await ownedExperience(id);
    const admin = createAdminClient();

    if (['pending_moderation', 'published'].includes(experience.status)) {
      const { error } = await admin
        .from('experiences')
        .update({ status: 'withdrawn' })
        .eq('id', id)
        .eq('profile_id', profile.id);
      if (error) throw error;
      return NextResponse.json({ status: 'withdrawn', deleted: false });
    }

    const { error } = await admin
      .from('experiences')
      .delete()
      .eq('id', id)
      .eq('profile_id', profile.id);
    if (error) throw error;
    return NextResponse.json({ status: 'deleted', deleted: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Story action failed' }, { status: 400 });
  }
}
