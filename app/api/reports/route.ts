import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enforceRateLimit, requestIpFromHeaders } from '@/lib/rate-limit';
import { z } from 'zod';

const schema = z.object({ experienceId: z.string().uuid(), reason: z.string().min(3).max(80), details: z.string().min(5).max(2000) });

export async function POST(req: NextRequest) {
  try {
    const input = schema.parse(await req.json());
    enforceRateLimit('story-report', `${requestIpFromHeaders(req.headers)}:${input.experienceId}`, 8, 60 * 60 * 1000);
    const supabase = await createClient();
    const { error } = await supabase.from('reports').insert({ experience_id: input.experienceId, reason: input.reason, details: input.details });
    if (error) throw error;
    return NextResponse.json({ received: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid report' }, { status: 400 });
  }
}
