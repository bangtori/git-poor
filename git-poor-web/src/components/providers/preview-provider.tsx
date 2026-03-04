'use client';

import { createContext, useContext } from 'react';

const PreviewContext = createContext(false);

export function PreviewProvider({
  children,
  isPreview,
}: {
  children: React.ReactNode;
  isPreview: boolean;
}) {
  return (
    <PreviewContext.Provider value={isPreview}>
      {children}
    </PreviewContext.Provider>
  );
}

export function usePreview() {
  return useContext(PreviewContext);
}
