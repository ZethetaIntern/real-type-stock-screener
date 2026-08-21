'use client';

import { useMemo, useCallback } from 'react';
import { useStockStore } from '@/stores/stockStore';
import { filterStocks, sortStocks } from '@/lib/filterEngine';

export function useStockScreener() {
  const stocks = useStockStore((s) => s.stocks);
  const activeFilters = useStockStore((s) => s.activeFilters);
  const sortConfig = useStockStore((s) => s.sortConfig);
  const setFilterExecutionTime = useStockStore((s) => s.setFilterExecutionTime);

  const filteredAndSortedStocks = useMemo(() => {
    const start = performance.now();
    const filtered = filterStocks(stocks, activeFilters);
    const sorted = sortStocks(filtered, sortConfig);
    const end = performance.now();
    setFilterExecutionTime(end - start);
    return sorted;
  }, [stocks, activeFilters, sortConfig, setFilterExecutionTime]);

  return {
    stocks: filteredAndSortedStocks,
    totalCount: stocks.length,
    filteredCount: filteredAndSortedStocks.length,
    filterExecutionTime: useStockStore.getState().filterExecutionTime,
  };
}
