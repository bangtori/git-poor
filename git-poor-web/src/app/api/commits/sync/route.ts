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
import { refreshGitHubToken } from '@/lib/api-service/auth-service';

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
    if (!session) {
      return NextResponse.json(
        { error: '인증 정보가 없습니다.' },
        { status: 401 },
      );
    }

    const user = session.user;
    // 토큰 만료 체크 및 리프레쉬 로직
    const { data: tokenData } = await adminSupabase
      .from('tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // 2. 사용할 토큰 결정 (기본값: 세션 토큰, 없으면 DB 토큰)
    let currentToken = session.provider_token || tokenData?.access_token;

    // 3. 만료 체크 및 갱신 시도
    if (tokenData && tokenData.token_expires_at) {
      const isExpired =
        new Date(tokenData.token_expires_at).getTime() <
        Date.now() + 5 * 60 * 1000;

      if (isExpired && tokenData.refresh_token) {
        console.log('🔄 토큰 만료 임박: 리프레쉬 시도...');
        const refreshRes = await refreshGitHubToken(tokenData.refresh_token);

        if (refreshRes.access_token) {
          await adminSupabase.from('tokens').upsert(
            {
              user_id: user.id,
              access_token: refreshRes.access_token,
              refresh_token:
                refreshRes.refresh_token || tokenData.refresh_token,
              token_expires_at: new Date(
                Date.now() + refreshRes.expires_in * 1000,
              ).toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' },
          );

          currentToken = refreshRes.access_token;
          console.log('✅ 토큰 갱신 완료');
        }
      }
    }

    if (!currentToken) {
      return NextResponse.json(
        { error: 'GitHub 연결 정보가 만료되었습니다. 다시 로그인해주세요.' },
        { status: 401 },
      );
    }

    const token = session.provider_token;

    const targetUsername = user.user_metadata.user_name;

    if (!targetUsername) {
      return NextResponse.json(
        { error: 'GitHub 계정 정보를 찾을 수 없습니다. (Username Missing)' },
        { status: 400 },
      );
    }
    // ------------ User 정보 초기화 로직 끝 ------------------

    const octokit = new Octokit({ auth: token });

    // 날짜 설정
    const now = new Date();
    const todayTarget = getGitPoorDate(now.toISOString()); // 기존 유틸 함수 사용

    // github 이벤트 가져오기
    const { data: events } =
      await octokit.rest.activity.listEventsForAuthenticatedUser({
        username: targetUsername,
        per_page: 100,
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

      // commits 목록이 있다면 담고 아니라면 head로 추적하기
      let targetCommits: string[] =
        payload.commits?.map((c: any) => c.sha) || [];
      if (targetCommits.length === 0 && payload.head) {
        targetCommits = [payload.head];
      }

      // before와 head가 살아있다면, 그 사이를 전부 조회
      const isComparisonPossible =
        payload.before &&
        payload.head &&
        payload.before !== '0000000000000000000000000000000000000000';

      if (isComparisonPossible) {
        try {
          const { data: comparison } = await octokit.rest.repos.compareCommits({
            owner,
            repo,
            base: payload.before,
            head: payload.head,
          });

          // 사이 commit 들의 sha 추가
          if (comparison.commits.length > 0) {
            targetCommits = comparison.commits.map((c) => c.sha);
          }
        } catch (error) {
          console.error(
            `Compare API 실패 (${repoName}), 기본값(Head) 유지:`,
            error,
          );
        }
      }

      // 한 이벤트 내의 커밋들도 병렬로 조회
      const commitPromises = targetCommits.map(async (sha) => {
        if (processedShas.has(sha)) return;

        try {
          // 커밋별 정보 가져오기
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
