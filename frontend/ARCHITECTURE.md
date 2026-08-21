# EquityPulse Architecture

## Component Hierarchy

```
App (layout.tsx)
├── Providers (QueryClientProvider, ThemeProvider)
│   └── ScreenerPage (page.tsx)
│       ├── OfflineBanner
│       ├── Header
│       │   ├── Logo
│       │   ├── ConnectionStatus
│       │   ├── ThemeToggle
│       │   └── PanelToggles
│       ├── FilterPanel (sidebar)
│       │   ├── PresetSelector
│       │   ├── ActiveFilterChips
│       │   ├── FilterGroup (Fundamentals)
│       │   │   └── RangeFilter × 12
│       │   ├── FilterGroup (Market Data)
│       │   │   └── RangeFilter × 6
│       │   ├── FilterGroup (Classification)
│       │   │   ├── MultiSelectFilter (Sector)
│       │   │   ├── MultiSelectFilter (Industry)
│       │   │   ├── MultiSelectFilter (Market Cap)
│       │   │   └── MultiSelectFilter (Index)
│       │   ├── FilterGroup (Technical)
│       │   │   ├── RangeFilter × 2
│       │   │   └── SingleSelectFilter × 5
│       │   └── FilterGroup (Custom)
│       │       ├── BooleanFilter (Watchlist)
│       │       └── BooleanFilter (Recently Updated)
│       ├── DataGrid
│       │   ├── HeaderRow (sortable, pinnable)
│       │   ├── VirtualRows
│       │   │   ├── WatchlistCell
│       │   │   ├── PriceCell (with flash animation)
│       │   │   ├── ChangeCell
│       │   │   ├── VolumeCell
│       │   │   ├── MarketCapCell
│       │   │   ├── RSICell
│       │   │   └── DataCells (P/E, P/B, ROE, etc.)
│       │   └── StatusBar
│       └── StockChart (lazy-loaded)
│           ├── ChartHeader
│           ├── ChartToolbar
│           │   ├── IndicatorToggles
│           │   └── TimeframeSelector
│           ├── CandlestickChart
│           │   ├── SMA Overlays
│           │   ├── EMA Overlays
│           │   ├── Bollinger Bands
│           │   └── Volume Profile
│           └── RSI Sub-chart
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      React Query                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Server State                                         │   │
│  │  • Stock universe (5000+ records)                   │   │
│  │  • OHLCV history (252 days)                         │   │
│  │  • Filter presets                                   │   │
│  │  • Sector/industry data                             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Zustand Store                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Client State    │  │ Real-Time State │  │ UI State    │ │
│  │  • activeFilters│  │  • livePrices   │  │  • theme    │ │
│  │  • sortConfig   │  │  • connection   │  │  • panels   │ │
│  │  • selected     │  │    status       │  │  • modals   │ │
│  │  • watchlist    │  │  • pending      │  │             │ │
│  │                 │  │    updates      │  │             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Components                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ FilterPanel │  │  DataGrid   │  │ StockChart  │         │
│  │ (selectors) │  │ (selectors) │  │ (selectors) │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
1. Page Load
   └── React Query fetches /api/stocks
       └── Stores in cache (staleTime: 5min)
           └── useStockData hook syncs to Zustand

2. Filter Application
   └── User adjusts filter in FilterPanel
       └── Zustand activeFilters updated
           └── useFilterEngine hook recalculates
               └── filterStocks() with predicate AST
                   └── sortStocks() applied
                       └── DataGrid re-renders with new data

3. Real-Time Updates
   └── WebSocket simulation (2s interval)
       └── simulateSectorMovement() with Brownian motion
           └── Updates buffered in Map
               └── Flushed via requestAnimationFrame
                   └── Zustand batchUpdatePrices()
                       └── Only affected cells re-render

4. Chart Interaction
   └── User clicks row in DataGrid
       └── selectedSymbol updated in Zustand
           └── StockChart lazy-loads
               └── generateOHLCV() creates 252 candles
                   └── Indicators calculated from scratch
                       └── Lightweight Charts renders
```

## Library Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 14 | App Router, Server Components, API routes, Vercel deployment |
| State Management | Zustand + Immer | Lightweight, no boilerplate, supports Map/Set for live prices |
| Server State | TanStack Query | Automatic caching, background refetch, stale-while-revalidate |
| Data Grid | TanStack Table v9 | Headless, flexible, good TypeScript support |
| Virtualization | TanStack Virtual | Integrates with TanStack Table, handles 5000+ rows |
| Charting | Lightweight Charts | Purpose-built for financial data, ~40KB, canvas-based |
| Styling | Tailwind CSS | Utility-first, dark mode support, design system tokens |
| Testing | Vitest | Fast, ESM-native, compatible with Vite/Next.js |
| Scrollbars | SimpleBar | Custom styled scrollbars, cross-browser consistency |
| Icons | Lucide React | Tree-shakeable, consistent icon set |

## Architectural Rationale

### Why Zustand over Redux?
Zustand requires no boilerplate, supports TypeScript natively, and allows granular subscriptions via selectors. For this app's state complexity (filters, selections, real-time prices), Zustand is ideal.

### Why TanStack Query for server state?
React Query handles caching, background refetching, and stale-while-revalidate automatically. This eliminates manual cache management for the stock universe data.

### Why Lightweight Charts over D3?
Lightweight Charts is purpose-built for financial data with canvas rendering (better performance than SVG). D3 would require significant custom implementation for candlestick charts.

### Why client-side price simulation?
The spec requires WebSocket simulation without a live market data provider. Client-side simulation with geometric Brownian motion provides realistic price movements without server infrastructure.

### Why predicate AST for filter engine?
A predicate AST enables:
- Selectivity-based reordering (most restrictive filters first)
- Short-circuit evaluation (skip remaining predicates on failure)
- Composable AND/OR logic
- Sub-200ms execution for 5000+ records

## Performance Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Performance Layers                        │
├─────────────────────────────────────────────────────────────┤
│ 1. Virtual Scrolling                                        │
│    • Only ~30 DOM nodes rendered (not 5000+)                │
│    • 36px fixed row height for O(1) scroll calculation      │
│    • 10-row overscan prevents blank flashes                 │
├─────────────────────────────────────────────────────────────┤
│ 2. Cell Memoization                                         │
│    • React.memo on all cell components                      │
│    • Per-symbol selectors (not entire livePrices map)       │
│    • Only changed cells re-render                           │
├─────────────────────────────────────────────────────────────┤
│ 3. WebSocket Batching                                       │
│    • Updates buffered in Map                                │
│    • Flushed via requestAnimationFrame                      │
│    • Single state update per frame                          │
├─────────────────────────────────────────────────────────────┤
│ 4. Filter Optimization                                      │
│    • Predicate reordering by selectivity                    │
│    • Short-circuit AND evaluation                           │
│    • useMemo for derived data                               │
├─────────────────────────────────────────────────────────────┤
│ 5. Code Splitting                                           │
│    • Chart lazy-loaded via next/dynamic                     │
│    • Dynamic imports for heavy dependencies                 │
└─────────────────────────────────────────────────────────────┘
```
