'use client';

import { useMemo, useCallback } from 'react';
import { useStockStore } from '@/stores/stockStore';
import { filterStocks, sortStocks } from '@/lib/filterEngine';
import { FilterConfig } from '@/types/stock';

export function useFilterEngine() {
  const stocks = useStockStore((s) => s.stocks);
  const activeFilters = useStockStore((s) => s.activeFilters);
  const sortConfig = useStockStore((s) => s.sortConfig);
  const watchlist = useStockStore((s) => s.watchlist);
  const livePrices = useStockStore((s) => s.livePrices);
  const addFilter = useStockStore((s) => s.addFilter);
  const removeFilter = useStockStore((s) => s.removeFilter);
  const updateFilter = useStockStore((s) => s.updateFilter);
  const clearAllFilters = useStockStore((s) => s.clearAllFilters);
  const loadPreset = useStockStore((s) => s.loadPreset);
  const setSortConfig = useStockStore((s) => s.setSortConfig);
  const setFilterExecutionTime = useStockStore((s) => s.setFilterExecutionTime);

  const filteredStocks = useMemo(() => {
    const start = performance.now();
    const enriched = stocks.map((stock) => ({
      ...stock,
      watchlistOnly: watchlist.has(stock.symbol),
      recentlyUpdated: livePrices.has(stock.symbol),
    }));
    const result = filterStocks(enriched, activeFilters);
    const end = performance.now();
    setFilterExecutionTime(end - start);
    return result;
  }, [stocks, activeFilters, watchlist, livePrices, setFilterExecutionTime]);

  const sortedStocks = useMemo(() => {
    return sortStocks(filteredStocks, sortConfig);
  }, [filteredStocks, sortConfig]);

  const setRangeFilter = useCallback(
    (field: string, range: [number, number]) => {
      const existing = activeFilters.find((f) => f.field === field);
      if (existing) {
        updateFilter(existing.id, { value: range });
      } else {
        addFilter({
          id: `${field}-${Date.now()}`,
          field: field as FilterConfig['field'],
          operator: 'between',
          value: range,
          enabled: true,
        });
      }
    },
    [activeFilters, addFilter, updateFilter]
  );

  const setMultiSelectFilter = useCallback(
    (field: string, selected: string[]) => {
      const existing = activeFilters.find((f) => f.field === field);
      if (selected.length === 0) {
        if (existing) removeFilter(existing.id);
        return;
      }
      if (existing) {
        updateFilter(existing.id, { value: selected });
      } else {
        addFilter({
          id: `${field}-${Date.now()}`,
          field: field as FilterConfig['field'],
          operator: 'in',
          value: selected,
          enabled: true,
        });
      }
    },
    [activeFilters, addFilter, updateFilter, removeFilter]
  );

  const setSingleSelectFilter = useCallback(
    (field: string, value: string | null) => {
      const existing = activeFilters.find((f) => f.field === field);
      if (value === null) {
        if (existing) removeFilter(existing.id);
        return;
      }
      if (existing) {
        updateFilter(existing.id, { value });
      } else {
        addFilter({
          id: `${field}-${Date.now()}`,
          field: field as FilterConfig['field'],
          operator: 'eq',
          value,
          enabled: true,
        });
      }
    },
    [activeFilters, addFilter, updateFilter, removeFilter]
  );

  const setBooleanFilter = useCallback(
    (field: string, value: boolean) => {
      const existing = activeFilters.find((f) => f.field === field);
      if (!value) {
        if (existing) removeFilter(existing.id);
        return;
      }
      if (existing) {
        updateFilter(existing.id, { value });
      } else {
        addFilter({
          id: `${field}-${Date.now()}`,
          field: field as FilterConfig['field'],
          operator: 'eq',
          value,
          enabled: true,
        });
      }
    },
    [activeFilters, addFilter, updateFilter, removeFilter]
  );

  return {
    filteredStocks: sortedStocks,
    totalCount: stocks.length,
    filteredCount: sortedStocks.length,
    activeFilters,
    sortConfig,
    setRangeFilter,
    setMultiSelectFilter,
    setSingleSelectFilter,
    setBooleanFilter,
    addFilter,
    removeFilter,
    updateFilter,
    clearAllFilters,
    loadPreset,
    setSortConfig,
  };
}
