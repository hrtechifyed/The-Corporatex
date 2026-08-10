import { NextResponse } from 'next/server';

const ACCEPTED_PLACE_TYPES = new Set([
  'city',
  'town',
  'village',
  'municipality',
  'borough',
  'district',
  'county',
  'state',
  'province',
  'region',
  'country',
  'continent',
  'administrative',
]);

type NominatimRow = {
  display_name?: string;
  addresstype?: string;
  type?: string;
  class?: string;
};

let lastNominatimRequestAt = 0;
let nominatimQueue: Promise<unknown> = Promise.resolve();

function basicPlaceShape(value: string) {
  return value.length >= 2
    && value.length <= 100
    && /\p{L}/u.test(value)
    && !/[<>]/.test(value);
}

function runRateLimited<T>(task: () => Promise<T>): Promise<T> {
  const run = nominatimQueue.then(async () => {
    const waitMs = Math.max(0, 1050 - (Date.now() - lastNominatimRequestAt));
    if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs));
    try {
      return await task();
    } finally {
      lastNominatimRequestAt = Date.now();
    }
  });
  nominatimQueue = run.then(() => undefined, () => undefined);
  return run;
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q')?.trim() || '';
  if (!basicPlaceShape(query)) {
    return NextResponse.json({ valid: false, error: 'Enter a real city, region or country.' }, { status: 422 });
  }

  const endpoint = new URL('https://nominatim.openstreetmap.org/search');
  endpoint.searchParams.set('q', query);
  endpoint.searchParams.set('format', 'jsonv2');
  endpoint.searchParams.set('addressdetails', '1');
  endpoint.searchParams.set('limit', '5');

  try {
    const rows = await runRateLimited(async () => {
      const response = await fetch(endpoint, {
        headers: {
          'User-Agent': 'CorporateX/1.0 (https://corporatex.onrender.com; contact: hrtechifyed@gmail.com)',
          Referer: 'https://corporatex.onrender.com/',
          Accept: 'application/json',
        },
        next: { revalidate: 86400 },
      });
      if (!response.ok) throw new Error(`Place service returned ${response.status}`);
      return await response.json() as NominatimRow[];
    });

    const match = rows.find((row) => {
      const addressType = String(row.addresstype || '').toLowerCase();
      const type = String(row.type || '').toLowerCase();
      return ACCEPTED_PLACE_TYPES.has(addressType)
        || ACCEPTED_PLACE_TYPES.has(type)
        || (row.class === 'place' && Boolean(addressType || type));
    });

    if (!match) {
      return NextResponse.json({ valid: false, error: 'We could not verify that location. Use a city, region or country.' }, { status: 422 });
    }

    return NextResponse.json({
      valid: true,
      matchedName: match.display_name || query,
    }, {
      headers: { 'Cache-Control': 'private, max-age=300' },
    });
  } catch (error) {
    console.error('CorporateX location validation unavailable', error);
    return NextResponse.json({
      valid: false,
      error: 'Place verification is temporarily unavailable. Please try again.',
    }, { status: 503 });
  }
}
