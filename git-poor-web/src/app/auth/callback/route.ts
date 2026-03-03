import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('2. 세션 교환 에러:', error);
      return NextResponse.redirect(`${origin}/?error=auth`);
    }
  }

  return NextResponse.redirect(`${origin}/home`);
}
