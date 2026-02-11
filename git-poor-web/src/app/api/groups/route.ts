import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCachedUser } from '@/lib/utils/auth-utils';
import { GroupRole } from '@/types';

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
      return NextResponse.json(
        { error: '인증 정보가 없습니다.' },
        { status: 401 },
      );
    }

    if (!name?.trim()) {
      return NextResponse.json(
        { error: '그룹 이름은 필수입니다.' },
        { status: 400 },
      );
    }

    if (!penalty_title?.trim()) {
      return NextResponse.json(
        { error: '벌칙 내용은 필수입니다.' },
        { status: 400 },
      );
    }

    if (
      typeof day_start_hour === 'number' &&
      (day_start_hour < 0 || day_start_hour > 23)
    ) {
      return NextResponse.json(
        { error: '시작 시간은 0시부터 23시 사이여야 합니다.' },
        { status: 400 },
      );
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
    const { data: groupData, error: addGroupError } = await supabase
      .from('groups')
      .insert(saveGroupData)
      .select()
      .single();

    if (addGroupError) {
      console.log('그룹 생성 에러' + addGroupError.message);
      return NextResponse.json(
        { error: '그룹 생성하는데 문제가 발생했습니다.' },
        { status: 500 },
      );
    }

    const { error: addGroupMemberError } = await supabase
      .from('group_members')
      .insert([
        { group_id: groupData.id, user_id: user.id, role: GroupRole.OWNER },
      ])
      .select();

    if (addGroupMemberError) {
      console.log('그룹 멤버 테이블 추가 에러' + addGroupMemberError.message);
      // 롤백: 방금 만든 그룹 삭제
      await supabase.from('groups').delete().eq('id', groupData.id);
      return NextResponse.json(
        { error: '그룹 생성하는데 문제가 발생했습니다.' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: groupData,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('error: ' + error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }
}
