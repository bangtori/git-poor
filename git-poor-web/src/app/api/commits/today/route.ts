// src/app/api/commits/today/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTodayCommitData } from '@/lib/api-service/commit-service';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 서비스 호출
    const data = await getTodayCommitData(supabase, user.id);

    // 결과 반환
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
