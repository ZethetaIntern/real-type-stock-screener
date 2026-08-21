'use client';

import { useEffect } from 'react';
import { useStockStore } from '@/stores/stockStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useStockStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}
