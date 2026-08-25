'use client';

import { useMemo } from 'react';
import { useStockStore } from '@/stores/stockStore';
import { filterStocks, sortStocks } from '@/lib/filterEngine';

export function useStockScreener() {
  const stocks = useStockStore((s) => s.stocks);
  const activeFilters = useStockStore((s) => s.activeFilters);
  const sortConfig = useStockStore((s) => s.sortConfig);
  const watchlist = useStockStore((s) => s.watchlist);
  const livePrices = useStockStore((s) => s.livePrices);
  const setFilterExecutionTime = useStockStore((s) => s.setFilterExecutionTime);

  const filteredAndSortedStocks = useMemo(() => {
    const start = performance.now();
    // Compute derived filter flags so "Watchlist Only" and "Recently Updated"
    // boolean filters can operate on the store's live watchlist and price map.
    const enriched = stocks.map((stock) => ({
      ...stock,
      watchlistOnly: watchlist.has(stock.symbol),
      recentlyUpdated: livePrices.has(stock.symbol),
    }));
    const filtered = filterStocks(enriched, activeFilters);
    const sorted = sortStocks(filtered, sortConfig);
    const end = performance.now();
    setFilterExecutionTime(end - start);
    return sorted;
  }, [stocks, activeFilters, sortConfig, watchlist, livePrices, setFilterExecutionTime]);

  return {
    stocks: filteredAndSortedStocks,
    totalCount: stocks.length,
    filteredCount: filteredAndSortedStocks.length,
    filterExecutionTime: useStockStore.getState().filterExecutionTime,
  };
}
