import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireModerator } from '@/lib/auth';
import { uuidSchema } from '@/lib/schemas';

const schema = z.object({ status: z.enum(['reviewing', 'resolved', 'dismissed']) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    uuidSchema.parse(id);
    const input = schema.parse(await req.json());
    const { supabase } = await requireModerator();
    const { error } = await supabase.from('reports').update({ status: input.status }).eq('id', id);
    if (error) throw error;
    return NextResponse.json({ status: input.status });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Report action failed' }, { status: 400 });
  }
}
