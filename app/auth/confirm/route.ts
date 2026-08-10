import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function safeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/account';
  return value;
}

function safeType(value: string | null): EmailOtpType | null {
  if (value === 'magiclink' || value === 'email') return value;
  return null;
}

function failureDestination(next: string, message: string) {
  const base = next.startsWith('/submit/') ? '/submit/verify' : '/login';
  return `${base}?error=${encodeURIComponent(message)}`;
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get('token_hash');
  const type = safeType(request.nextUrl.searchParams.get('type'));
  const next = safeNext(request.nextUrl.searchParams.get('next'));

  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL(failureDestination(next, 'The verification link is incomplete. Request a new one.'), request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    return NextResponse.redirect(new URL(failureDestination(next, error.message), request.url));
  }

  return NextResponse.redirect(new URL(next, request.url));
}
