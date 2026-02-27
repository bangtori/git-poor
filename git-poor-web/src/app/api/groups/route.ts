import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCachedUser } from '@/lib/utils/auth-utils';
import { GroupRole } from '@/types';
import { getMyGroupsService } from '@/services/group-service';
import {
  ok,
  created,
  badRequest,
  unauthorized,
  fail,
  serverError,
} from '@/lib/http/reponse-service';
import { AppError } from '@/lib/error/app-error';

/**
 * -----------------------------------------------------------------------------
 * [API Specification]
 * -----------------------------------------------------------------------------
 * @method POST
 * @summary 새로운 그룹 생성
 * @description
 * - 새로운 스터디/프로젝트 그룹을 생성합니다.
 * - 인증된 사용자(Session User)가 자동으로 그룹의 소유자(owner_id)로 설정됩니다.
 * - 그룹의 기본 규칙(벌칙 내용, 주말 적용 여부, 타임존 등)을 설정합니다.
 * - 요청 예시:
 * POST /api/groups
 * body: {
 * "name": "아침 6시 기상 스터디",
 * "penalty_title": "지각비 1000원",
 * "apply_penalty_weekend": true,
 * "timezone": "Asia/Seoul",
 * "day_start_hour": 6
 * }
 *
 * @requestBody {application/json}
 * - name (string, required): 그룹 이름
 * - penalty_title (string, required): 벌칙 이름 (DB 컬럼: penalry_title)
 * - apply_penalty_weekend (boolean, optional): 주말 벌칙 적용 여부 (Default: false)
 * - timezone (string, optional): 그룹 기준 타임존 (Default: 'Asia/Seoul')
 * - day_start_hour (number, optional): 하루 시작 시간 (0~23) (Default: 0)
 *
 * @response 201 (Created)
 * - 성공적으로 그룹이 생성됨.
 * - Type: { success: true, data: { id: string, name: string, ... } }
 *
 * @response 400 (Bad Request)
 * - 필수 데이터(name, penalty_title)가 누락되었을 때 발생.
 *
 * @response 401 (Unauthorized)
 * - 로그인하지 않은 사용자가 요청했을 때 발생.
 *
 * @response 500 (Internal Server Error)
 * - DB Insert 실패 또는 서버 에러 발생 시.
 * -----------------------------------------------------------------------------
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      penalty_title,
      apply_penalty_weekend,
      timezone,
      day_start_hour,
    } = body;

    const user = await getCachedUser();

    if (!user) {
      return unauthorized('인증 정보가 없습니다.');
    }

    if (!name?.trim()) {
      return badRequest('그룹 이름은 필수입니다.');
    }

    if (!penalty_title?.trim()) {
      return badRequest('벌칙 내용은 필수입니다.');
    }

    if (
      typeof day_start_hour === 'number' &&
      (day_start_hour < 0 || day_start_hour > 23)
    ) {
      return badRequest('시작 시간은 0시부터 23시 사이여야 합니다.');
    }

    // 데이터 저장
    const saveGroupData = {
      owner_id: user.id,
      name,
      timezone: timezone || 'Asia/Seoul',
      day_start_hour: day_start_hour ?? 5,
      penalty_title,
      apply_penalty_weekend: apply_penalty_weekend || true,
    };

    const supabase = await createClient();
    const admin = createAdminClient();
    const { data: groupData, error: addGroupError } = await supabase
      .from('groups')
      .insert(saveGroupData)
      .select()
      .single();

    if (addGroupError) {
      console.log('그룹 생성 에러' + addGroupError.message);
      return fail('SERVER_ERROR', '그룹 생성하는데 문제가 발생했습니다.');
    }

    const { error: addGroupMemberError } = await admin
      .from('group_members')
      .insert([
        { group_id: groupData.id, user_id: user.id, role: GroupRole.OWNER },
      ])
      .select();

    if (addGroupMemberError) {
      console.log('그룹 멤버 테이블 추가 에러' + addGroupMemberError.message);
      // 롤백: 방금 만든 그룹 삭제
      await supabase.from('groups').delete().eq('id', groupData.id);
      return fail('SERVER_ERROR', '그룹 생성하는데 문제가 발생했습니다.');
    }

    return created(groupData);
  } catch (error) {
    console.error('error: ' + error);
    return serverError();
  }
}

/**
 * -----------------------------------------------------------------------------
 * [API Specification]
 * -----------------------------------------------------------------------------
 * @method GET
 * @summary 내 그룹 목록 조회 (페이지네이션 적용)
 * @description
 * - 현재 로그인한 사용자가 멤버로 가입된 그룹 리스트를 가져옵니다.
 * - 쿼리 파라미터(page, limit)를 통해 페이징 처리를 지원합니다.
 * - 요청 예시: GET /api/groups?page=1&limit=10
 *
 * @queryParams
 * - page (number, optional): 페이지 번호 (Default: 1)
 * - limit (number, optional): 한 번에 가져올 개수 (Default: 10)
 *
 * @response 200 (OK)
 * - 성공 시 그룹 리스트와 페이징 정보를 반환
 * - Type:
 * {
 * success: true,
 * data: [
 * {
 * id: string,
 * name: string,
 * penalty_title: string,
 * member_count: number,
 * is_owner: boolean,
 * penalty_count: number,
 * ...
 * },
 * ...
 * ],
 * meta: {
 * page: number,        // 현재 페이지
 * limit: number,       // 페이지당 개수
 * total_count: number, // 전체 그룹 수
 * total_pages: number, // 전체 페이지 수
 * has_next_page: boolean // 다음 페이지 존재 여부
 * }
 * }
 *
 * @response 401 (Unauthorized)
 * - 로그인하지 않은 경우
 * -----------------------------------------------------------------------------
 */
export async function GET(request: Request) {
  try {
    const user = await getCachedUser();
    if (!user) {
      return unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;

    // Group Service 호출
    const { data, meta } = await getMyGroupsService(user.id, page, limit);

    return ok(data, { meta });
  } catch (error) {
    if (error instanceof AppError) {
      return fail(error.code, error.message, error.details);
    }
    console.error('error: ', error);
    return serverError('서버 에러가 발생했습니다.');
  }
}
