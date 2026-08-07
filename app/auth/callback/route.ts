import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function safeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/account';
  return value;
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const next = safeNext(req.nextUrl.searchParams.get('next'));

  if (!code) {
    const destination = next.startsWith('/submit/')
      ? `/submit/verify?error=${encodeURIComponent('The verification link is incomplete. Request a new one.')}`
      : `/login?error=${encodeURIComponent('The verification link is incomplete. Request a new one.')}`;
    return NextResponse.redirect(new URL(destination, req.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const destination = next.startsWith('/submit/')
      ? `/submit/verify?error=${encodeURIComponent(error.message)}`
      : `/login?error=${encodeURIComponent(error.message)}`;
    return NextResponse.redirect(new URL(destination, req.url));
  }

  return NextResponse.redirect(new URL(next, req.url));
}
