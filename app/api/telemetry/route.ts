import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  event: z.string().regex(/^[a-z0-9_:-]{3,64}$/i),
  path: z.string().regex(/^\/[a-zA-Z0-9_\-/?=&.]*$/).max(160),
  at: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const input = schema.parse(await req.json());
    console.info('corporatex_funnel', {
      event: input.event,
      path: input.path.split('?')[0],
      at: input.at,
      receivedAt: Date.now(),
    });
    return NextResponse.json({ accepted: true }, { status: 202, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Invalid telemetry event' }, { status: 400 });
  }
}
