import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCachedUser } from '@/lib/utils/auth-utils';
import { CommitDetail } from '@/types/commit';

/**
 * -----------------------------------------------------------------------------
 * [API Specification]
 * -----------------------------------------------------------------------------
 * @method GET
 * @summary 특정 날짜의 커밋 상세 목록 조회
 * @description
 * - 캘린더에서 특정 날짜를 클릭했을 때, 해당 일자에 발생한 모든 커밋 리스트를 반환합니다.
 * - 레포지토리명, 변경 라인 수, 언어, 커밋 링크 등의 상세 정보를 포함합니다.
 * - 인증된 사용자(본인)의 데이터만 조회할 수 있습니다.
 * - 요청 예시: /api/commits?date=2026-02-10
 *
 * @param {string} date - (Query Param) 조회할 날짜 (Format: YYYY-MM-DD)
 *
 * @response 200 (OK)
 * - 성공적으로 데이터를 반환함.
 * - Type: {@link CommitDetail}[]
 *
 * @response 400 (Bad Request)
 * - 필수 파라미터(date)가 누락되었을 때 발생.
 *
 * @response 401 (Unauthorized)
 * - 로그인하지 않은 사용자가 요청했을 때 발생.
 *
 * @response 500 (Internal Server Error)
 * - DB 연결 실패 또는 쿼리 에러 발생 시.
 * -----------------------------------------------------------------------------
 */

export async function GET(request: Request) {
  try {
    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    //[Validation] 필수 파라미터 체크
    if (!date) {
      return NextResponse.json(
        { error: '날짜를 필수로 지정해주세요.' },
        { status: 400 },
      );
    }

    // Supabase 연결
    const user = await getCachedUser();
    if (!user) {
      return NextResponse.json(
        { error: '유저 정보가 존재하지 않습니다.' },
        { status: 401 },
      );
    }

    // DB 조회하기
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('commits')
      .select(
        `
        id,
        repo_name,
        commit_sha,
        commit_url,
        total_changes,
        additions,
        deletions,
        languages,
        committed_at,
        commit_date
      `,
      )
      .eq('user_id', user.id)
      .eq('commit_date', date)
      .order('committed_at', { ascending: false });

    if (error) {
      console.error('지정 날짜 커밋 데이터 불러오기 에러' + error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json<CommitDetail[]>(data || []);
  } catch (error) {
    console.error('[Server Error] 특정 날짜 커밋 가져오기 API Error: ' + error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }
}
