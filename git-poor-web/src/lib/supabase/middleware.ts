import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // 1. 초기 응답 객체 생성
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Supabase 클라이언트 생성
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // 3. 유저 정보 가져오기 (매우 중요: getSession 대신 getUser 사용 권장)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4. 리다이렉트 로직 추가 (여기부터 추가된 내용)
  // ------------------------------------------------

  // 로그인 안 된 상태로 /home 접근 시 -> 로그인 페이지(/)로 튕기기
  if (!user && request.nextUrl.pathname.startsWith('/home')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // 로그인 된 상태로 로그인 페이지(/) 접근 시 -> 홈(/home)으로 보내기
  if (user && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/home';
    return NextResponse.redirect(url);
  }

  // ------------------------------------------------

  return response;
}
