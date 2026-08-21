# Task 4: Rework Filter Engine with Predicate AST

**Files:**
- Modify: `frontend/src/lib/filterEngine.ts`
- Create: `frontend/src/__tests__/filters/filterEngine.test.ts`

**Interfaces:**
- Produces: `filterStocks(stocks: Stock[], filters: FilterConfig[]): Stock[]` and `sortStocks(stocks: Stock[], config: SortConfig): Stock[]`
- Consumes: `Stock`, `FilterConfig`, `SortConfig` from `types/stock.ts`

## Step 1: Write failing tests

Create `frontend/src/__tests__/filters/filterEngine.test.ts` with these tests:

```typescript
import { describe, it, expect } from 'vitest';
import { filterStocks, sortStocks } from '@/lib/filterEngine';
import { Stock, FilterConfig, SortConfig } from '@/types/stock';

function makeStock(overrides: Partial<Stock> = {}): Stock {
  return {
    symbol: 'TEST0001',
    companyName: 'Test Company',
    sector: 'IT',
    industry: 'Software Services',
    marketCapCategory: 'Large Cap',
    indexMembership: ['NIFTY 50'],
    lastPrice: 1000,
    previousClose: 990,
    dayOpen: 995,
    dayHigh: 1010,
    dayLow: 990,
    changePercent: 1.01,
    changeAbsolute: 10,
    volume: 1000000,
    avgVolume20D: 800000,
    week52High: 1200,
    week52Low: 800,
    marketCap: 500000000000,
    pe: 25,
    pb: 5,
    dividendYield: 1.5,
    eps: 40,
    roe: 20,
    roce: 25,
    debtToEquity: 0.3,
    currentRatio: 2,
    promoterHolding: 60,
    revenueGrowthYoY: 15,
    profitGrowthYoY: 20,
    rsi14: 55,
    sma50: 980,
    sma200: 950,
    beta: 0.9,
    atr: 20,
    macdSignal: 'Bullish',
    bollingerPosition: 'Within',
    volumeVsAvg: 'Above',
    ...overrides,
  };
}

describe('filterStocks', () => {
  it('returns all stocks when no filters applied', () => {
    const stocks = [makeStock(), makeStock({ symbol: 'TEST0002' })];
    const result = filterStocks(stocks, []);
    expect(result).toHaveLength(2);
  });

  it('filters by range (gte)', () => {
    const stocks = [makeStock({ pe: 10 }), makeStock({ pe: 30 })];
    const filters: FilterConfig[] = [{ id: '1', field: 'pe', operator: 'gte', value: 20, enabled: true }];
    const result = filterStocks(stocks, filters);
    expect(result).toHaveLength(1);
    expect(result[0].pe).toBe(30);
  });

  it('filters by range (between)', () => {
    const stocks = [makeStock({ rsi14: 25 }), makeStock({ rsi14: 50 }), makeStock({ rsi14: 75 })];
    const filters: FilterConfig[] = [{ id: '1', field: 'rsi14', operator: 'between', value: [30, 70], enabled: true }];
    const result = filterStocks(stocks, filters);
    expect(result).toHaveLength(1);
    expect(result[0].rsi14).toBe(50);
  });

  it('filters by multi-select (in)', () => {
    const stocks = [makeStock({ sector: 'IT' }), makeStock({ sector: 'Banking' }), makeStock({ sector: 'Pharma' })];
    const filters: FilterConfig[] = [{ id: '1', field: 'sector', operator: 'in', value: ['IT', 'Banking'], enabled: true }];
    const result = filterStocks(stocks, filters);
    expect(result).toHaveLength(2);
  });

  it('skips disabled filters', () => {
    const stocks = [makeStock({ pe: 10 }), makeStock({ pe: 30 })];
    const filters: FilterConfig[] = [{ id: '1', field: 'pe', operator: 'gte', value: 20, enabled: false }];
    const result = filterStocks(stocks, filters);
    expect(result).toHaveLength(2);
  });

  it('combines multiple filters with AND logic', () => {
    const stocks = [
      makeStock({ pe: 10, roe: 20 }),
      makeStock({ pe: 30, roe: 20 }),
      makeStock({ pe: 10, roe: 5 }),
    ];
    const filters: FilterConfig[] = [
      { id: '1', field: 'pe', operator: 'gte', value: 20, enabled: true },
      { id: '2', field: 'roe', operator: 'gte', value: 15, enabled: true },
    ];
    const result = filterStocks(stocks, filters);
    expect(result).toHaveLength(1);
    expect(result[0].pe).toBe(30);
  });

  it('handles null pe values', () => {
    const stocks = [makeStock({ pe: null }), makeStock({ pe: 25 })];
    const filters: FilterConfig[] = [{ id: '1', field: 'pe', operator: 'gte', value: 20, enabled: true }];
    const result = filterStocks(stocks, filters);
    expect(result).toHaveLength(1);
    expect(result[0].pe).toBe(25);
  });

  it('filters 5000 stocks in under 200ms', () => {
    const stocks: Stock[] = [];
    for (let i = 0; i < 5000; i++) {
      stocks.push(makeStock({ symbol: `STOCK${i}`, marketCap: Math.random() * 1000000000000, pe: Math.random() * 50, rsi14: Math.random() * 100 }));
    }
    const filters: FilterConfig[] = [
      { id: '1', field: 'marketCap', operator: 'gte', value: 500000000000, enabled: true },
      { id: '2', field: 'pe', operator: 'between', value: [10, 30], enabled: true },
      { id: '3', field: 'rsi14', operator: 'between', value: [30, 70], enabled: true },
    ];
    const start = performance.now();
    filterStocks(stocks, filters);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(200);
  });
});

describe('sortStocks', () => {
  it('sorts by numeric column ascending', () => {
    const stocks = [makeStock({ marketCap: 300 }), makeStock({ marketCap: 100 }), makeStock({ marketCap: 200 })];
    const config: SortConfig = { column: 'marketCap', direction: 'asc' };
    const result = sortStocks(stocks, config);
    expect(result.map((s) => s.marketCap)).toEqual([100, 200, 300]);
  });

  it('sorts by string column ascending', () => {
    const stocks = [makeStock({ symbol: 'C' }), makeStock({ symbol: 'A' }), makeStock({ symbol: 'B' })];
    const config: SortConfig = { column: 'symbol', direction: 'asc' };
    const result = sortStocks(stocks, config);
    expect(result.map((s) => s.symbol)).toEqual(['A', 'B', 'C']);
  });

  it('sorts descending', () => {
    const stocks = [makeStock({ marketCap: 100 }), makeStock({ marketCap: 300 })];
    const config: SortConfig = { column: 'marketCap', direction: 'desc' };
    const result = sortStocks(stocks, config);
    expect(result.map((s) => s.marketCap)).toEqual([300, 100]);
  });
});
```

## Step 2: Run tests to verify they fail

```bash
cd frontend && npx vitest run src/__tests__/filters/filterEngine.test.ts
```

Expected: FAIL — `filterStocks` signature doesn't match or doesn't exist.

## Step 3: Rewrite filterEngine.ts with predicate AST

Replace `frontend/src/lib/filterEngine.ts` with:

```typescript
import { Stock, FilterConfig, FilterOperator, FilterValue, SortConfig } from '@/types/stock';

type Predicate = (stock: Stock) => boolean;

function createPredicate(field: keyof Stock, operator: FilterOperator, value: FilterValue): Predicate {
  return (stock: Stock) => {
    const stockValue = stock[field];

    // Handle null values
    if (stockValue === null || stockValue === undefined) {
      if (operator === 'eq' && value === null) return true;
      return false;
    }

    switch (operator) {
      case 'eq':
        return stockValue === value;
      case 'neq':
        return stockValue !== value;
      case 'gt':
        return typeof stockValue === 'number' && typeof value === 'number' && stockValue > value;
      case 'gte':
        return typeof stockValue === 'number' && typeof value === 'number' && stockValue >= value;
      case 'lt':
        return typeof stockValue === 'number' && typeof value === 'number' && stockValue < value;
      case 'lte':
        return typeof stockValue === 'number' && typeof value === 'number' && stockValue <= value;
      case 'between': {
        if (!Array.isArray(value) || value.length !== 2) return false;
        const [min, max] = value as number[];
        return typeof stockValue === 'number' && stockValue >= min && stockValue <= max;
      }
      case 'in':
        return Array.isArray(value) && value.includes(stockValue as string);
      case 'notIn':
        return Array.isArray(value) && !value.includes(stockValue as string);
      case 'contains':
        return typeof stockValue === 'string' && typeof value === 'string' && stockValue.toLowerCase().includes(value.toLowerCase());
      default:
        return true;
    }
  };
}

// Selectivity ordering: numeric ranges first, then category filters
function getSelectivity(filter: FilterConfig): number {
  const numericOperators = ['between', 'gte', 'lte', 'gt', 'lt'];
  if (numericOperators.includes(filter.operator)) return 0;
  if (filter.operator === 'in' || filter.operator === 'notIn') return 1;
  return 2;
}

export function filterStocks(stocks: Stock[], filters: FilterConfig[]): Stock[] {
  const enabledFilters = filters.filter((f) => f.enabled);
  if (enabledFilters.length === 0) return stocks;

  // Sort by selectivity for short-circuit optimization
  const sorted = [...enabledFilters].sort((a, b) => getSelectivity(a) - getSelectivity(b));

  // Build predicate chain
  const predicates = sorted.map((f) => createPredicate(f.field, f.operator, f.value));

  // Execute with short-circuit
  return stocks.filter((stock) => {
    for (const predicate of predicates) {
      if (!predicate(stock)) return false;
    }
    return true;
  });
}

export function sortStocks(stocks: Stock[], config: SortConfig): Stock[] {
  const { column, direction } = config;
  return [...stocks].sort((a, b) => {
    const aVal = a[column];
    const bVal = b[column];

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    let comparison = 0;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      comparison = aVal.localeCompare(bVal);
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      comparison = aVal - bVal;
    }

    return direction === 'asc' ? comparison : -comparison;
  });
}
```

## Step 4: Run tests to verify they pass

```bash
npx vitest run src/__tests__/filters/filterEngine.test.ts
```

Expected: All 10 tests PASS.

## Step 5: Commit

```bash
git add src/lib/filterEngine.ts src/__tests__/filters/filterEngine.test.ts
git commit -m "feat(filters): rewrite filter engine with predicate AST and short-circuit evaluation"
```
