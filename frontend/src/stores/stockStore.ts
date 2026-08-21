import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools, persist } from 'zustand/middleware';
import { Stock, FilterConfig, SortConfig, PriceUpdate, ConnectionStatus } from '@/types/stock';

interface StockStore {
  // Stock data
  stocks: Stock[];
  setStocks: (stocks: Stock[]) => void;

  // Filter state (spec-compliant)
  activeFilters: FilterConfig[];
  addFilter: (filter: FilterConfig) => void;
  removeFilter: (filterId: string) => void;
  updateFilter: (filterId: string, updates: Partial<FilterConfig>) => void;
  clearAllFilters: () => void;
  loadPreset: (filters: FilterConfig[]) => void;

  // Sort state
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;

  // Selection state
  selectedSymbol: string | null;
  setSelectedSymbol: (symbol: string | null) => void;

  // Real-time prices
  livePrices: Map<string, PriceUpdate>;
  batchUpdatePrices: (updates: Map<string, PriceUpdate>) => void;

  // Watchlist
  watchlist: Set<string>;
  toggleWatchlist: (symbol: string) => void;

  // Connection status
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;

  // UI state
  filterPanelOpen: boolean;
  setFilterPanelOpen: (open: boolean) => void;
  chartOpen: boolean;
  setChartOpen: (open: boolean) => void;

  // Performance tracking
  filterExecutionTime: number;
  setFilterExecutionTime: (time: number) => void;
}

export const useStockStore = create<StockStore>()(
  devtools(
    persist(
      immer((set) => ({
        // Stock data
        stocks: [],
        setStocks: (stocks) => set({ stocks }),

        // Filter state
        activeFilters: [],
        addFilter: (filter) =>
          set((state) => {
            state.activeFilters.push(filter);
          }),
        removeFilter: (filterId) =>
          set((state) => {
            state.activeFilters = state.activeFilters.filter((f) => f.id !== filterId);
          }),
        updateFilter: (filterId, updates) =>
          set((state) => {
            const idx = state.activeFilters.findIndex((f) => f.id === filterId);
            if (idx !== -1) Object.assign(state.activeFilters[idx], updates);
          }),
        clearAllFilters: () =>
          set((state) => {
            state.activeFilters = [];
          }),
        loadPreset: (filters) =>
          set((state) => {
            state.activeFilters = filters;
          }),

        // Sort state
        sortConfig: { column: 'marketCap', direction: 'desc' },
        setSortConfig: (config) => set({ sortConfig: config }),

        // Selection state
        selectedSymbol: null,
        setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),

        // Real-time prices
        livePrices: new Map(),
        batchUpdatePrices: (updates) =>
          set((state) => {
            updates.forEach((update, symbol) => {
              state.livePrices.set(symbol, { ...update, timestamp: Date.now() });
            });
          }),

        // Watchlist
        watchlist: new Set(),
        toggleWatchlist: (symbol) =>
          set((state) => {
            if (state.watchlist.has(symbol)) {
              state.watchlist.delete(symbol);
            } else {
              state.watchlist.add(symbol);
            }
          }),

        // Connection status
        connectionStatus: 'disconnected',
        setConnectionStatus: (status) => set({ connectionStatus: status }),

        // UI state
        filterPanelOpen: true,
        setFilterPanelOpen: (open) => set({ filterPanelOpen: open }),
        chartOpen: false,
        setChartOpen: (open) => set({ chartOpen: open }),

        // Performance tracking
        filterExecutionTime: 0,
        setFilterExecutionTime: (time) => set({ filterExecutionTime: time }),
      })),
      {
        name: 'stock-store',
        partialize: (state) => ({ watchlist: state.watchlist }),
      }
    ),
    { name: 'stock-store' }
  )
);
