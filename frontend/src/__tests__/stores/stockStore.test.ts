import { describe, it, expect, beforeEach } from 'vitest';
import { useStockStore } from '@/stores/stockStore';

describe('StockStore', () => {
  beforeEach(() => {
    useStockStore.setState({
      stocks: [],
      activeFilters: [],
      sortConfig: { column: 'marketCap', direction: 'desc' },
      selectedSymbol: null,
      livePrices: new Map(),
      watchlist: new Set(),
      connectionStatus: 'disconnected',
      filterPanelOpen: true,
      chartOpen: false,
    });
  });

  it('adds, updates, removes and clears active filters', () => {
    const { addFilter, updateFilter, removeFilter, clearAllFilters } = useStockStore.getState();

    addFilter({ id: 'f1', field: 'marketCap', operator: 'gte', value: 1000, enabled: true });
    expect(useStockStore.getState().activeFilters).toHaveLength(1);

    updateFilter('f1', { value: 5000 });
    expect(useStockStore.getState().activeFilters[0].value).toBe(5000);

    addFilter({ id: 'f2', field: 'pe', operator: 'between', value: [10, 30], enabled: true });
    expect(useStockStore.getState().activeFilters).toHaveLength(2);

    removeFilter('f1');
    expect(useStockStore.getState().activeFilters.map((f) => f.id)).toEqual(['f2']);

    clearAllFilters();
    expect(useStockStore.getState().activeFilters).toEqual([]);
  });

  it('loads a preset (replaces active filters)', () => {
    const { addFilter, loadPreset } = useStockStore.getState();
    addFilter({ id: 'x', field: 'roe', operator: 'gt', value: 15, enabled: true });
    loadPreset([{ id: 'p1', field: 'sector', operator: 'in', value: ['IT'], enabled: true }]);
    expect(useStockStore.getState().activeFilters).toHaveLength(1);
    expect(useStockStore.getState().activeFilters[0].id).toBe('p1');
  });

  it('toggles the watchlist', () => {
    const { toggleWatchlist } = useStockStore.getState();
    toggleWatchlist('TCS');
    expect(useStockStore.getState().watchlist.has('TCS')).toBe(true);
    toggleWatchlist('TCS');
    expect(useStockStore.getState().watchlist.has('TCS')).toBe(false);
  });

  it('batches live price updates', () => {
    const { batchUpdatePrices } = useStockStore.getState();
    const updates = new Map([
      ['TCS', { symbol: 'TCS', price: 100, change: 1, changePercent: 1, timestamp: Date.now() }],
    ]);
    batchUpdatePrices(updates);
    const live = useStockStore.getState().livePrices.get('TCS');
    expect(live?.price).toBe(100);
    expect(typeof live?.timestamp).toBe('number');
  });

  it('manages selection, connection and UI state', () => {
    const { setSelectedSymbol, setConnectionStatus, setChartOpen, setFilterPanelOpen } =
      useStockStore.getState();
    setSelectedSymbol('RELIANCE');
    setConnectionStatus('connected');
    setChartOpen(true);
    setFilterPanelOpen(false);

    const s = useStockStore.getState();
    expect(s.selectedSymbol).toBe('RELIANCE');
    expect(s.connectionStatus).toBe('connected');
    expect(s.chartOpen).toBe(true);
    expect(s.filterPanelOpen).toBe(false);
  });

  it('sets sort configuration', () => {
    useStockStore.getState().setSortConfig({ column: 'companyName', direction: 'asc' });
    expect(useStockStore.getState().sortConfig).toEqual({ column: 'companyName', direction: 'asc' });
  });
});
