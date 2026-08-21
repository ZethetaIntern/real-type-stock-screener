'use client';

import { useEffect, useCallback } from 'react';
import { useStockStore } from '@/stores/stockStore';

interface UseKeyboardNavOptions {
  onEnter?: () => void;
  onEscape?: () => void;
  onToggleFilters?: () => void;
  onToggleChart?: () => void;
  onSearch?: () => void;
}

export function useKeyboardNav(options: UseKeyboardNavOptions = {}) {
  const { filterPanelOpen, setFilterPanelOpen, chartOpen, setChartOpen } = useStockStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

      if (isInput) return;

      switch (e.key) {
        case 'f':
        case 'F':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setFilterPanelOpen(!filterPanelOpen);
            options.onToggleFilters?.();
          }
          break;

        case 'c':
        case 'C':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setChartOpen(!chartOpen);
            options.onToggleChart?.();
          }
          break;

        case '/':
          e.preventDefault();
          options.onSearch?.();
          break;

        case 'Escape':
          options.onEscape?.();
          break;

        case 'Enter':
          options.onEnter?.();
          break;
      }
    },
    [filterPanelOpen, chartOpen, setFilterPanelOpen, setChartOpen, options]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    filterPanelOpen,
    chartOpen,
    toggleFilters: () => setFilterPanelOpen(!filterPanelOpen),
    toggleChart: () => setChartOpen(!chartOpen),
  };
}
