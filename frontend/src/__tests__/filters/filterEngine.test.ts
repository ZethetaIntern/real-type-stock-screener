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

  it('filters by notIn and contains', () => {
    const stocks = [
      makeStock({ sector: 'IT' }),
      makeStock({ sector: 'Banking' }),
      makeStock({ sector: 'Pharma' }),
      makeStock({ sector: 'FMCG', companyName: 'Tata Consultancy' }),
      makeStock({ sector: 'Auto', companyName: 'Wipro' }),
    ];
    const notInFilter: FilterConfig[] = [{ id: '1', field: 'sector', operator: 'notIn', value: ['IT'], enabled: true }];
    expect(filterStocks(stocks, notInFilter)).toHaveLength(4);

    const containsFilter: FilterConfig[] = [{ id: '1', field: 'companyName', operator: 'contains', value: 'tata', enabled: true }];
    const result = filterStocks(stocks, containsFilter);
    expect(result).toHaveLength(1);
    expect(result[0].companyName).toBe('Tata Consultancy');
  });

  it('handles neq, gt, lt and lte operators', () => {
    const stocks = [makeStock({ pe: 10 }), makeStock({ pe: 20 }), makeStock({ pe: 30 }), makeStock({ pe: 40 })];
    const neqFilter: FilterConfig[] = [{ id: '1', field: 'pe', operator: 'neq', value: 20, enabled: true }];
    expect(filterStocks(stocks, neqFilter)).toHaveLength(3);

    const gtFilter: FilterConfig[] = [{ id: '1', field: 'pe', operator: 'gt', value: 20, enabled: true }];
    expect(filterStocks(stocks, gtFilter)).toHaveLength(2);

    const ltFilter: FilterConfig[] = [{ id: '1', field: 'pe', operator: 'lt', value: 30, enabled: true }];
    expect(filterStocks(stocks, ltFilter)).toHaveLength(2);

    const lteFilter: FilterConfig[] = [{ id: '1', field: 'pe', operator: 'lte', value: 20, enabled: true }];
    expect(filterStocks(stocks, lteFilter)).toHaveLength(2);
  });

  it('matches null values with eq of null', () => {
    const stocks = [{ ...makeStock(), pe: null } as Stock, makeStock({ pe: 5 })];
    const filters: FilterConfig[] = [
      { id: '1', field: 'pe', operator: 'eq', value: null as unknown as number, enabled: true },
    ];
    const result = filterStocks(stocks, filters);
    expect(result).toHaveLength(1);
    expect(result[0].pe).toBeNull();
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

  it('sorts by string with localeCompare and respects direction', () => {
    const stocks = [makeStock({ symbol: 'b' }), makeStock({ symbol: 'A' }), makeStock({ symbol: 'c' })];
    const config: SortConfig = { column: 'symbol', direction: 'desc' };
    const result = sortStocks(stocks, config);
    expect(result.map((s) => s.symbol)).toEqual(['c', 'b', 'A']);
  });
});
