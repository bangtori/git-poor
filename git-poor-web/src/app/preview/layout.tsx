// src/app/preview/layout.tsx
import { PreviewProvider } from '@/components/providers/preview-provider';

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PreviewProvider isPreview={true}>{children}</PreviewProvider>;
}
