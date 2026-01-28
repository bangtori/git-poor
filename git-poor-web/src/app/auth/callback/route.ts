import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  // 디버깅용 로그 추가
  console.log('1. 콜백 실행됨. Code 존재 여부:', !!code);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('2. 세션 교환 에러:', error);
      return NextResponse.redirect(`${origin}/?error=auth`);
    }
    console.log('3. 세션 교환 성공!');
  }

  return NextResponse.redirect(`${origin}/home`);
}
