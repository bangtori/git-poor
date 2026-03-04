import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // 깃허브 이미지 도메인 허용
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com', // ✅ 목업용 다이스베어 추가
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com', // ✅ 목업용 이니셜 아바타
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
