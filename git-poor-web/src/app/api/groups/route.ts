import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCachedUser } from '@/lib/utils/auth-utils';

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
export async function POST(request: Request) {}
