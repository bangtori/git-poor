// src/app/api/commits/today/route.ts
import { createClient } from '@/lib/supabase/server';
import { getTodayCommitData } from '@/lib/api-service/commit-service';
import { ok, unauthorized, serverError } from '@/lib/http/reponse-service';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return unauthorized();
    }

    // 서비스 호출
    const data = await getTodayCommitData(supabase, user.id);

    // 결과 반환
    return ok(data);
  } catch (error) {
    console.error('API Error:', error);
    return serverError();
  }
}
