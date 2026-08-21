'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useStockStore } from '@/stores/stockStore';
import { Stock } from '@/types/stock';

interface UseKeyboardNavOptions {
  stocks?: Stock[];
  onStockSelect?: (symbol: string) => void;
}

export function useKeyboardNav(options: UseKeyboardNavOptions = {}) {
  const { stocks = [], onStockSelect } = options;
  const {
    filterPanelOpen,
    setFilterPanelOpen,
    chartOpen,
    setChartOpen,
    selectedSymbol,
    setSelectedSymbol,
    toggleWatchlist,
  } = useStockStore();

  const focusedRowIndex = useRef<number>(-1);
  const showCheatSheet = useRef<boolean>(false);

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
          }
          break;

        case 'c':
        case 'C':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setChartOpen(!chartOpen);
          }
          break;

        case '/':
          e.preventDefault();
          const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
          break;

        case 'Escape':
          if (showCheatSheet.current) {
            showCheatSheet.current = false;
          }
          break;

        case 'Enter':
          if (selectedSymbol) {
            setChartOpen(true);
          }
          break;

        case ' ':
          e.preventDefault();
          if (selectedSymbol) {
            toggleWatchlist(selectedSymbol);
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (stocks.length > 0) {
            focusedRowIndex.current = Math.min(focusedRowIndex.current + 1, stocks.length - 1);
            setSelectedSymbol(stocks[focusedRowIndex.current].symbol);
            onStockSelect?.(stocks[focusedRowIndex.current].symbol);
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (stocks.length > 0) {
            focusedRowIndex.current = Math.max(focusedRowIndex.current - 1, 0);
            setSelectedSymbol(stocks[focusedRowIndex.current].symbol);
            onStockSelect?.(stocks[focusedRowIndex.current].symbol);
          }
          break;

        case 'Home':
          e.preventDefault();
          if (stocks.length > 0) {
            focusedRowIndex.current = 0;
            setSelectedSymbol(stocks[0].symbol);
            onStockSelect?.(stocks[0].symbol);
          }
          break;

        case 'End':
          e.preventDefault();
          if (stocks.length > 0) {
            focusedRowIndex.current = stocks.length - 1;
            setSelectedSymbol(stocks[stocks.length - 1].symbol);
            onStockSelect?.(stocks[stocks.length - 1].symbol);
          }
          break;

        case 'PageDown':
          e.preventDefault();
          if (stocks.length > 0) {
            focusedRowIndex.current = Math.min(focusedRowIndex.current + 20, stocks.length - 1);
            setSelectedSymbol(stocks[focusedRowIndex.current].symbol);
            onStockSelect?.(stocks[focusedRowIndex.current].symbol);
          }
          break;

        case 'PageUp':
          e.preventDefault();
          if (stocks.length > 0) {
            focusedRowIndex.current = Math.max(focusedRowIndex.current - 20, 0);
            setSelectedSymbol(stocks[focusedRowIndex.current].symbol);
            onStockSelect?.(stocks[focusedRowIndex.current].symbol);
          }
          break;

        case '?':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            showCheatSheet.current = !showCheatSheet.current;
          }
          break;

        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            if (chartOpen) {
              setChartOpen(false);
            } else if (filterPanelOpen) {
              setFilterPanelOpen(false);
            }
          } else {
            if (!filterPanelOpen) {
              setFilterPanelOpen(true);
            } else if (!chartOpen) {
              setChartOpen(true);
            }
          }
          break;
      }
    },
    [
      filterPanelOpen,
      chartOpen,
      selectedSymbol,
      stocks,
      setFilterPanelOpen,
      setChartOpen,
      setSelectedSymbol,
      toggleWatchlist,
      onStockSelect,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    filterPanelOpen,
    chartOpen,
    selectedSymbol,
    showCheatSheet: showCheatSheet.current,
    toggleFilters: () => setFilterPanelOpen(!filterPanelOpen),
    toggleChart: () => setChartOpen(!chartOpen),
  };
}
