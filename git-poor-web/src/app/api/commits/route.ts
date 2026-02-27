import { createClient } from '@/lib/supabase/server';
import { CommitDetail } from '@/types/commit';
import {
  ok,
  fail,
  unauthorized,
  serverError,
  badRequest,
} from '@/lib/http/reponse-service';
import { AppError } from '@/lib/error/app-error';

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
 * @queryParams
 * - date (string, required): 조회할 날짜 (YYYY-MM-DD)
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
    const date = searchParams.get('date');

    if (!date) {
      return badRequest('날짜 파라미터가 필요합니다.');
    }

    const { data: commits, error } = await supabase
      .from('commits')
      .select('*')
      .eq('user_id', user.id)
      .eq('commit_date', date)
      .order('committed_at', { ascending: false });

    if (error) {
      console.error('지정 날짜 커밋 데이터 불러오기 에러' + error.message);
      return fail('SERVER_ERROR', '커밋 데이터를 불러오는데 실패했습니다.');
    }

    return ok(commits);
  } catch (error) {
    if (error instanceof AppError) {
      return fail(error.code, error.message, error.details);
    }
    console.error('[Server Error] 특정 날짜 커밋 가져오기 API Error:', error);
    return serverError('서버 에러가 발생했습니다.');
  }
}
