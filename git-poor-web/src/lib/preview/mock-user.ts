/**
 * Preview 모드용 Mock User 데이터
 *
 * Supabase `User` 타입(@supabase/supabase-js)의 부분 구현.
 * 컴포넌트에서 실제 참조하는 필드만 포함합니다.
 */
import type { User } from '@supabase/supabase-js';

/** Preview에서 공통으로 사용할 고정 userId */
export const PREVIEW_USER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

/**
 * `UserProfileCard`, `MyProfileSection` 등에서 사용하는 User mock.
 *
 * 실제 참조 필드:
 *  - id, email
 *  - user_metadata.avatar_url
 *  - user_metadata.full_name
 *  - user_metadata.user_name
 */
export const mockUser: User = {
  id: PREVIEW_USER_ID,
  email: 'gitpoor-dev@example.com',
  app_metadata: {},
  user_metadata: {
    avatar_url:
      'https://ui-avatars.com/api/?name=김개발&background=0D8ABC&color=fff&size=128',
    full_name: '김개발',
    user_name: 'gitpoor-dev',
  },
  aud: 'authenticated',
  created_at: '2025-06-15T09:00:00.000Z',
} as User;
