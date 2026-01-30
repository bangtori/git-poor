// 토큰 재발급 로직
export async function refreshGitHubToken(refreshToken: string) {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_ID,
      client_secret: process.env.GITHUB_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });
  return await response.json();
}
