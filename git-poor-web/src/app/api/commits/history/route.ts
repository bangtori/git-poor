import { getCachedUser } from '@/lib/utils/auth-utils';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * -----------------------------------------------------------------------------
 * [API Specification]
 * -----------------------------------------------------------------------------
 * @method GET
 * @summary 특정 기간 내의 내 커밋 히스토리 조회
 * @description
 * - 캘린더 뷰 렌더링을 위해 특정 날짜 범위(from ~ to)에 해당하는 커밋 데이터를 조회합니다.
 * - 인증된 사용자(본인)의 데이터만 조회할 수 있습니다.
 * - 요청 예시 /api/commits/history?from=2026-02-01&to=2026-02-28
 *
 * @param {string} from - (Query Param) 조회 시작 날짜 (Format: YYYY-MM-DD)
 * @param {string} to   - (Query Param) 조회 종료 날짜 (Format: YYYY-MM-DD)
 *
 * @response 200 (OK)
 * - 성공적으로 데이터를 반환함.
 * - Type: Record<string, { commit_date: string, commit_count: number, total_changes: number }>
 * - Structure:
 * {
 * "2026-02-01": { "commit_date": "2026-02-01", "commit_count": 3, "total_changes": 150 },
 * "2026-02-02": { "commit_date": "2026-02-02", "commit_count": 0, "total_changes": 0 },
 * ...
 * }
 *
 * @response 400 (Bad Request)
 * - 필수 파라미터(from, to)가 누락되었을 때 발생.
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
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    //[Validation] 필수 파라미터 체크
    if (!from || !to) {
      return NextResponse.json(
        { error: '날짜 범위(from, to)가 필요합니다.' },
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
      .select('commit_date, total_changes')
      .eq('user_id', user.id) // 가져온 user의 ID 사용
      .gte('commit_date', from)
      .lte('commit_date', to)
      .order('commit_date', { ascending: true });

    if (error) {
      console.log('커밋 데이터 불러오기 에러' + error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 데이터 가공 -> 같은 날짜 통합
    const dailyStats = data.reduce(
      (acc, curr) => {
        const dateKey = curr.commit_date;

        if (!acc[dateKey]) {
          // 해당 날짜의 첫 데이터면 초기화
          acc[dateKey] = {
            commit_date: dateKey,
            commit_count: 0,
            total_changes: 0,
          };
        }

        // 누적 계산
        acc[dateKey].commit_count += 1; // 커밋 개수 +1
        acc[dateKey].total_changes += curr.total_changes || 0; // 변경량 합산

        return acc;
      },
      {} as Record<
        string,
        { commit_date: string; commit_count: number; total_changes: number }
      >,
    );

    return NextResponse.json(dailyStats);
  } catch (error) {
    console.error('error: ' + error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }
}
