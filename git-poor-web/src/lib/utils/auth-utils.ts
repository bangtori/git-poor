import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

// 유저 정보 캐시 -> 한 번의 랜더링 사이클에선 캐시 보존으로 최적화
export const getCachedUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
