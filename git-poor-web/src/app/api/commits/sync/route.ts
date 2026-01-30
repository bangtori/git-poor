import { NextResponse } from 'next/server';
import { Octokit } from 'octokit';
import { createClient } from '@/lib/supabase/server';
import { getGitPoorDate } from '@/lib/utils/date-utils';
import { getExtension, inferLanguage } from '@/lib/utils/git-info-utils';
import {
  updateStreakIncremental,
  getStreakData,
} from '@/lib/api-service/streak-service';
import { createAdminClient } from '@/lib/supabase/admin';

// ---------------------------------------------------------
// 메인 로직 (POST)
// ---------------------------------------------------------
export async function POST() {
  try {
    // supabase & User 초기화
    const supabase = await createClient();
    const adminSupabase = createAdminClient(); // 스트릭 업데이트용 어드민 클라이언트
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session || !session.provider_token) {
      return NextResponse.json(
        {
          error:
            'GitHub 연결 정보가 만료되었습니다. 로그아웃 후 다시 로그인해주세요.',
        },
        { status: 401 },
      );
    }

    // 유저 정보 확인 & Octokit 설정
    const user = session.user;
    const token = session.provider_token;

    const targetUsername = user.user_metadata.user_name;

    if (!targetUsername) {
      return NextResponse.json(
        { error: 'GitHub 계정 정보를 찾을 수 없습니다. (Username Missing)' },
        { status: 400 },
      );
    }

    const octokit = new Octokit({ auth: token });

    // 날짜 설정
    const now = new Date();
    const todayTarget = getGitPoorDate(now.toISOString()); // 기존 유틸 함수 사용

    console.log(`[서버] 사용자: ${targetUsername}, 타겟 날짜: ${todayTarget}`);

    // github 이벤트 가져오기
    const { data: events } =
      await octokit.rest.activity.listEventsForAuthenticatedUser({
        username: targetUsername,
        per_page: 30,
      });

    // 오늘자 푸시이벤트 필터링
    const todayPushEvents = events.filter(
      (event) =>
        event.type === 'PushEvent' &&
        getGitPoorDate(event.created_at!) === todayTarget,
    );

    // 스트릭 데이터를 담을 변수
    let streakInfo = { current_streak: 0, longest_streak: 0 };

    // 커밋이 없으면 null 대신 비워진 데이터 반환
    if (todayPushEvents.length === 0) {
      // 커밋이 없어도 현재 스트릭 정보는 가져와서 반환함
      const currentStreak = await getStreakData(adminSupabase, user.id);

      return NextResponse.json({
        success: true,
        message: '오늘의 커밋이 없습니다.',
        data: {
          date: todayTarget,
          commit_count: 0,
          total_changes: 0,
          languages: [],
          is_success: false,
          streak: currentStreak, // 스트릭 기본값 포함
        },
      });
    }

    // 데이터 수집 및 가공 (병렬 처리)
    const commitsToInsert: any[] = [];
    const processedShas = new Set<string>();

    // 모든 푸시 이벤트에 대해 작업을 동시에 시작 -> 병렬 처리
    const eventPromises = todayPushEvents.map(async (event) => {
      const repoName = event.repo.name;
      const [owner, repo] = repoName.split('/');
      const payload = event.payload as any;
      const isPrivate = !event.public;

      // Organization 로직: commits 목록이 비면 head 커밋 추적
      let targetCommits: string[] =
        payload.commits?.map((c: any) => c.sha) || [];
      if (targetCommits.length === 0 && payload.head) {
        targetCommits = [payload.head];
      }

      // 한 이벤트 내의 커밋들도 병렬로 조회
      const commitPromises = targetCommits.map(async (sha) => {
        if (processedShas.has(sha)) return;

        try {
          const { data: commitDetail } = await octokit.rest.repos.getCommit({
            owner,
            repo,
            ref: sha,
          });

          // 날짜 재확인 (Head 추적 시 필수)
          const commitDate = commitDetail.commit.author?.date;
          if (commitDate && getGitPoorDate(commitDate) === todayTarget) {
            if (!processedShas.has(sha)) {
              // 중복 체크
              processedShas.add(sha);

              const commitLanguages = new Set<string>();
              const commitExtensions = new Set<string>();

              commitDetail.files?.forEach((file) => {
                if (file.filename) {
                  const ext = getExtension(file.filename);
                  if (ext) {
                    commitExtensions.add(ext);
                    const lang = inferLanguage(ext);
                    if (lang !== 'Other') commitLanguages.add(lang);
                  }
                }
              });

              // DB Insert 용 객체 생성
              const commitRow = {
                user_id: user.id,
                commit_sha: sha,
                repo_name: repoName,
                committed_at: commitDate,
                commit_date: todayTarget,

                change_files: commitDetail.files?.length || 0,
                additions: commitDetail.stats?.additions || 0,
                deletions: commitDetail.stats?.deletions || 0,
                total_changes:
                  (commitDetail.stats?.additions || 0) +
                  (commitDetail.stats?.deletions || 0),

                languages: Array.from(commitLanguages),
                file_extensions: Array.from(commitExtensions),

                is_private: isPrivate,
                commit_url: commitDetail.html_url,
                created_at: new Date().toISOString(),
              };

              commitsToInsert.push(commitRow);
            }
          }
        } catch (err) {
          console.error(`❌ 조회 실패 (${sha}):`, err);
        }
      });

      await Promise.all(commitPromises);
    });

    await Promise.all(eventPromises);

    // Supabase DB 저장 및 스트릭 업데이트
    if (commitsToInsert.length > 0) {
      const { error: upsertError } = await supabase
        .from('commits')
        .upsert(commitsToInsert, { onConflict: 'user_id, commit_sha' });

      if (upsertError) {
        console.error('Supabase 저장 에러:', upsertError);
        throw new Error('데이터베이스 저장 실패');
      }
      console.log(`[DB] ${commitsToInsert.length}개 커밋 저장 완료`);

      // 스트릭 업데이트 (Admin 권한 사용)
      console.log('스트릭 업데이트 시작...');
      const updatedStreak = await updateStreakIncremental(
        adminSupabase,
        user.id,
      );
      streakInfo = {
        current_streak: updatedStreak.current,
        longest_streak: updatedStreak.longest,
      };
      console.log('스트릭 업데이트 완료!');
    }

    // ---------------------------------------------------------
    // 결과 반환
    // ---------------------------------------------------------

    // 삽입된 데이터 기준으로 통계 집계
    const totalStats = commitsToInsert.reduce(
      (acc, curr) => ({
        changes: acc.changes + curr.total_changes,
        langs: new Set([...acc.langs, ...curr.languages]),
      }),
      { changes: 0, langs: new Set<string>() },
    );

    const resultData = {
      date: todayTarget,
      commit_count: commitsToInsert.length,
      total_changes: totalStats.changes,
      languages: Array.from(totalStats.langs),
      is_success: commitsToInsert.length > 0,
      streak: streakInfo, // 최신 스트릭 정보 포함
    };

    return NextResponse.json({
      success: true,
      message: '분석 및 저장 완료',
      data: resultData,
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
