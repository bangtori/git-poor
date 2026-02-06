import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

// 유저 정보 캐시 -> 한 번의 랜더링 사이클에선 캐시 보존으로 최적화
export const getCachedUser = cache(async () => {
  console.log('🔥 [API 요청] Supabase getUser() 실행');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
