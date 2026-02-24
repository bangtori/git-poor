import { createClient } from '@/lib/supabase/server';
import {
  ok,
  fail,
  serverError,
  unauthorized,
  badRequest,
} from '@/lib/http/reponse-service';
import { getHistoryMapByDateRange } from '@/services/history-service';

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
 * - 시작 날짜(from)와 종료 날짜(to) 사이의 일별 커밋 통계를 반환합니다.
 * @queryParams
 * - from (string, required): 조회 시작 날짜 (YYYY-MM-DD)
 * - to (string, required): 조회 종료 날짜 (YYYY-MM-DD)
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // 쿼리 파라미터가 없으면 에러 혹은 기본 로직 처리 (여기서는 심플하게)
    if (!from || !to) {
      return badRequest('날짜 범위가 필요합니다.');
    }

    // --- 날짜 범위에 해당하는 커밋들 가져오기 ---
    const result = await getHistoryMapByDateRange(user.id, from, to);

    if (!result.success) {
      console.error(result.error);
      return fail('커밋 데이터를 불러오는데 실패했습니다.');
    }

    // --- 날짜별로 그루핑  ---
    // 결과 형태: { "2024-02-01": { count: 3, total_changes: 150 }, ... }
    const historyMap = result.data;

    return ok(historyMap);
  } catch {
    return serverError();
  }
}
