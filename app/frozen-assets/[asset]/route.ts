import { FROZEN_CARDS, FROZEN_HERO } from '@/lib/frozen-home-assets';

const assets: Record<string, string> = {
  hero: FROZEN_HERO,
  'card-1': FROZEN_CARDS[0],
  'card-2': FROZEN_CARDS[1],
  'card-3': FROZEN_CARDS[2],
  'card-4': FROZEN_CARDS[3],
  'card-5': FROZEN_CARDS[4],
};

export async function GET(_request: Request, { params }: { params: Promise<{ asset: string }> }) {
  const { asset } = await params;
  const source = assets[asset];
  if (!source) return new Response('Not found', { status: 404 });

  const encoded = source.slice(source.indexOf(',') + 1);
  const body = Buffer.from(encoded, 'base64');

  return new Response(body, {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
