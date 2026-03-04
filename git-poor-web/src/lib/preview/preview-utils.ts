import { usePreview } from '@/components/providers/preview-provider';

export function usePreviewUtils() {
  const isPreview = usePreview();

  const blocked = () =>
    alert('Preview 모드에서는 사용할 수 없습니다. 로그인 후 이용하세요.');

  const basePath = isPreview ? '/preview' : '';

  const previewLink = (path: string) => `${basePath}${path}`;

  return { isPreview, blocked, basePath, previewLink };
}
