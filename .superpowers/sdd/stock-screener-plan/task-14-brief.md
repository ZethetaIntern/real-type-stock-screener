# Task 14: useStockScreener Hook Update and Integration

**Files:**
- Modify: `frontend/src/hooks/useStockScreener.ts`

**Interfaces:**
- Produces: `useStockScreener()` returning `{ stocks, totalCount, filteredCount, filterExecutionTime, updateSearch }`
- Consumes: React Query for stock data, Zustand for filters/sort, `filterStocks()` + `sortStocks()` from filter engine

## Current State

The existing `useStockScreener.ts` references the old `FilterCriteria` interface which no longer exists. It needs to be rewritten to use the new `FilterConfig[]` from the store.

## Rewrite

```typescript
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
```

## Verify

1. Run `npm run dev`
2. Verify the page loads and shows stock count
3. Apply filters and verify the count updates
4. Check that `filterExecutionTime` is displayed

## Step: Commit

```bash
git add src/hooks/useStockScreener.ts
git commit -m "feat(screener): wire useStockScreener with React Query and predicate filter engine"
```
