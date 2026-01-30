// src/lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';

export const createAdminClient = () => {
  // 서버 환경에서만 동작
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
};
