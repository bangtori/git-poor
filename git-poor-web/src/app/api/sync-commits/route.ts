// src/app/api/sync-commits/route.ts
import { NextResponse } from 'next/server';
import { Octokit } from 'octokit';

// UTC + 4시간 = GitPoor 기준 날짜
const getGitPoorDate = (isoString: string) => {
  const date = new Date(isoString);
  date.setHours(date.getHours() + 4);
  return date.toISOString().split('T')[0];
};

const inferLanguage = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: 'TypeScript',
    tsx: 'TypeScript',
    js: 'JavaScript',
    jsx: 'JavaScript',
    swift: 'Swift',
    py: 'Python',
    java: 'Java',
    css: 'CSS',
    html: 'HTML',
  };
  return map[ext || ''] || 'Other';
};

export async function POST() {
  try {
    const token = process.env.GITHUB_ACCESS_TOKEN;
    const octokit = new Octokit({ auth: token });
    const { data: user } = await octokit.rest.users.getAuthenticated();

    const now = new Date();
    const todayTarget = new Date(now.getTime() + 4 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const { data: events } =
      await octokit.rest.activity.listEventsForAuthenticatedUser({
        username: user.login,
        per_page: 30,
      });

    // 오늘자 PushEvent만 필터링
    const todayPushEvents = events.filter(
      (event) =>
        event.type === 'PushEvent' &&
        getGitPoorDate(event.created_at!) === todayTarget,
    );

    if (todayPushEvents.length === 0) {
      return NextResponse.json({
        success: true,
        message: '커밋 없음',
        data: null,
      });
    }

    let totalAdditions = 0;
    let totalDeletions = 0;
    const languageSet = new Set<string>();
    // 중복 커밋 집계를 방지하기 위한 Set
    const processedShas = new Set<string>();

    // 상세 조회
    for (const event of todayPushEvents) {
      const repoName = event.repo.name;
      const [owner, repo] = repoName.split('/');
      const payload = event.payload as any;

      // Organization 권한 이슈 -> 커밋 목록이 비어있으면 head라도 가져오기
      let targetCommits: string[] =
        payload.commits?.map((c: any) => c.sha) || [];

      if (targetCommits.length === 0 && payload.head) {
        console.log(
          `[Organization 권한 이슈] ${repoName}: 커밋 목록 없음. Head 커밋(${payload.head.substring(0, 7)}) 추적 시도`,
        );
        targetCommits = [payload.head];
      }

      for (const sha of targetCommits) {
        // 이미 처리한 커밋이면 스킵 (중복 방지)
        if (processedShas.has(sha)) continue;

        try {
          const { data: commitDetail } = await octokit.rest.repos.getCommit({
            owner,
            repo,
            ref: sha,
          });

          // Head 커밋은 "옛날 커밋"일 수도 있으니 날짜를 한 번 더 체크해야 함
          // (오늘 브랜치만 생성하고 코드는 안 짠 경우를 거르기 위함)
          const commitDate = commitDetail.commit.author?.date;
          if (commitDate && getGitPoorDate(commitDate) === todayTarget) {
            const add = commitDetail.stats?.additions || 0;
            const del = commitDetail.stats?.deletions || 0;

            totalAdditions += add;
            totalDeletions += del;
            processedShas.add(sha); // 처리 완료 처리

            commitDetail.files?.forEach((file) => {
              if (file.filename) {
                const lang = inferLanguage(file.filename);
                if (lang !== 'Other') languageSet.add(lang);
              }
            });
            console.log(
              `  ✅ 집계 완료: ${sha.substring(0, 7)} (+${add}/-${del})`,
            );
          } else {
            console.log(`  ⚠️ 날짜 불일치로 제외: ${sha.substring(0, 7)}`);
          }
        } catch (err) {
          console.error(`  ❌ 조회 실패 (${sha}):`, err);
        }
      }
    }

    const resultData = {
      date: todayTarget,
      commit_count: processedShas.size, // 실제 유효한 커밋 수
      total_changes: totalAdditions + totalDeletions,
      languages: Array.from(languageSet),
      is_success: processedShas.size > 0, // 유효 커밋이 1개라도 있어야 성공
    };

    console.log('[서버] 최종 결과:', resultData);

    return NextResponse.json({
      success: true,
      message: '분석 완료',
      data: resultData,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
