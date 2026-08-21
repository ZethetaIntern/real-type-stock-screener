# EquityPulse Stock Screener — Design Spec

**Date:** 2026-08-21
**Status:** Approved for implementation
**Approach:** Incremental rework of existing codebase

## 1. Goal

Build a production-grade real-time Indian equity screener that handles 5,000+ stocks with sub-200ms filter response, interactive candlestick charts with 5 technical indicators, virtual scrolling, and WebSocket price streaming — all on React 18 + Next.js 14 with TypeScript strict mode.

## 2. Architecture

### 2.1 Component Hierarchy

```
App Layout (Server Component — metadata, fonts)
└── ScreenerPage (Client Component)
    ├── Header
    │   ├── Logo + title
    │   ├── Search input (global stock search)
    │   ├── Connection status indicator (green/yellow/red)
    │   └── Filter toggle button
    ├── FilterPanel (compound component, left sidebar, w-80)
    │   ├── ActiveFilterChips (removable filter badges)
    │   ├── FilterGroup[Fundamentals] (accordion)
    │   │   ├── RangeFilter (Market Cap, P/E, P/B, EPS, ROE, ROCE, D/E, etc.)
    │   │   └── ...
    │   ├── FilterGroup[Market Data] (accordion)
    │   │   ├── RangeFilter (LTP, 52W High/Low proximity, Volume, Beta, Day Change)
    │   │   └── ...
    │   ├── FilterGroup[Classification] (accordion)
    │   │   ├── MultiSelectFilter (Sector, Industry, Market Cap Category, Index)
    │   │   └── ...
    │   ├── FilterGroup[Technical] (accordion)
    │   │   ├── RangeFilter (RSI, ATR)
    │   │   ├── SingleSelectFilter (MACD Signal, Price vs SMA50/200, Bollinger Position)
    │   │   └── ...
    │   ├── FilterGroup[Custom] (accordion)
    │   │   ├── BooleanFilter (Watchlist Only)
    │   │   └── ...
    │   ├── PresetSelector (Value Stocks, Growth Momentum, etc.)
    │   └── Clear All Filters button
    ├── DataGrid (TanStack Table + TanStack Virtual, main area)
    │   ├── Sticky header row (sortable columns)
    │   ├── Pinned Symbol column (left)
    │   ├── Virtualized rows (36px fixed height, 10 overscan)
    │   └── Cell renderers: PriceCell, ChangeCell, VolumeCell, MarketCapCell, RSICell, WatchlistCell
    └── StockChart (right panel, lazy-loaded via dynamic import)
        ├── Chart header (symbol, company, price, change)
        ├── Indicator toggles (SMA, EMA, Bollinger, RSI, Volume Profile)
        ├── Timeframe selector (1D, 1W, 1M, 3M, 1Y, 5Y)
        ├── Candlestick series (Lightweight Charts)
        ├── Overlay indicators (SMA/EMA/Bollinger lines on main chart)
        ├── RSI sub-chart (separate pane below)
        └── Volume Profile (horizontal histogram overlay)
```

### 2.2 State Management

| Layer | Tool | What it holds |
|-------|------|---------------|
| Server state | React Query (TanStack Query) | Stock universe, OHLCV history, filter presets, sector/index data |
| Client state | Zustand | Active filters (`FilterConfig[]`), sort config, selected symbol, watchlist, UI prefs (filter panel open, chart open) |
| Real-time state | Zustand + immer | Live prices (`Map<string, PriceData>`), connection status, pending update buffer |

**Key Zustand selectors** for granular re-renders:
- `useStockStore(s => s.activeFilters)` — filter panel only
- `useStockStore(s => s.livePrices.get(symbol))` — per-cell price updates
- `useStockStore(s => s.selectedSymbol)` — chart component only

### 2.3 Data Flow

```
1. Page load → React Query fetches GET /api/stocks → cached in queryClient
2. useStockScreener hook:
   - reads stocks from React Query cache
   - reads activeFilters + sortConfig from Zustand
   - useMemo: filterStocks(stocks, filters) → sortStocks(filtered, sortConfig)
   - returns final array to DataGrid
3. WebSocket connection → price updates buffered in Map → flushed via requestAnimationFrame → Zustand batchUpdatePrices
4. DataGrid cells read livePrices from Zustand via selector → only changed cells re-render
5. Chart subscribes to livePrices for selected symbol → updates candlestick series
```

## 3. Filter Engine Design

### 3.1 Predicate AST

Each filter becomes a leaf predicate function. Filters combine with AND logic (all must pass). OR groups supported via a group node.

```typescript
type PredicateNode =
  | { type: 'leaf'; field: keyof Stock; operator: FilterOperator; value: FilterValue }
  | { type: 'and'; children: PredicateNode[] }
  | { type: 'or'; children: PredicateNode[] };
```

### 3.2 Execution Pipeline

1. **Parse** — Convert `FilterConfig[]` into `PredicateNode` tree
2. **Optimize** — Reorder leaf predicates by selectivity (numeric ranges first, category filters after)
3. **Execute** — Iterate stocks, short-circuit on AND failures
4. **Sort** — Apply sort config (stable sort)
5. **Return** — Filtered + sorted array

### 3.3 Required Filters (30+)

| Category | Filter | Type |
|----------|--------|------|
| Fundamentals | Market Cap, P/E, P/B, Dividend Yield, EPS, ROE, ROCE, D/E, Current Ratio, Promoter Holding, Revenue Growth, Profit Growth | Range |
| Market Data | LTP, 52W High/Low proximity, Avg Volume (20D), Beta, Day Change | Range |
| Classification | Sector, Industry, Market Cap Category, Index Membership | MultiSelect |
| Technical | RSI (14), ATR | Range |
| Technical | MACD Signal, Price vs SMA50, Price vs SMA200, Bollinger Position, Volume vs 20D Avg | SingleSelect |
| Custom | Watchlist Only | Boolean |

### 3.4 Preset Configurations

- **Value Stocks:** P/E < 15, ROE > 15%, D/E < 0.5, Dividend Yield > 2%
- **Growth Momentum:** Revenue Growth > 20%, Profit Growth > 20%, RSI 40-70, Price > SMA50
- **Large Cap Quality:** Market Cap > 20,000 Cr, ROCE > 15%, Promoter Holding > 50%
- **Technical Breakout:** Price > SMA200, RSI 50-70, Volume > 2x avg, Bollinger within bands

## 4. DataGrid Design

### 4.1 Columns (15+)

Symbol (pinned), Company, LTP, % Change, Volume, Market Cap, P/E, P/B, Sector, RSI, ROE, ROCE, D/E, Dividend Yield, Beta, Day Change

### 4.2 Cell Renderers

- **PriceCell** — INR format, 2 decimals, `font-mono tabular-nums`
- **ChangeCell** — Green/red with arrow icon, `text-positive`/`text-negative`
- **VolumeCell** — Abbreviated (Cr/L/K)
- **MarketCapCell** — Indian format in Cr
- **RSICell** — Color-coded background (green < 30, yellow 30-70, red > 70)
- **WatchlistCell** — Star toggle button

### 4.3 Virtual Scrolling

- Fixed row height: 36px
- Overscan: 10 rows
- `requestAnimationFrame`-based scroll throttling
- Only visible rows + overscan in DOM

### 4.4 Keyboard Navigation

- Arrow keys: move cell focus
- Enter: open chart for selected row
- Space: toggle watchlist
- Home/End: first/last row
- Page Up/Down: scroll by viewport

## 5. Chart Design

### 5.1 Library

Lightweight Charts (TradingView) — canvas-based, ~40KB, WebSocket-friendly API.

### 5.2 Indicators

| Indicator | Implementation | Overlay |
|-----------|---------------|---------|
| SMA (20, 50, 200) | `calculateSMA()` — arithmetic mean | Line on main chart |
| EMA (12, 26) | `calculateEMA()` — exponential decay | Line on main chart |
| Bollinger Bands | SMA(20) ± 2σ | Lines + fill area on main chart |
| RSI (14) | Smoothed gain/loss method | Separate sub-chart pane |
| Volume Profile | Volume distributed across price buckets | Horizontal bars overlay |

### 5.3 Features

- Timeframe switching (1D, 1W, 1M, 3M, 1Y, 5Y)
- Crosshair with OHLCV tooltip
- Responsive resize
- Real-time candle updates from WebSocket
- Indicator toggle controls in toolbar

## 6. WebSocket Design

### 6.1 Server (Next.js API Route)

`/api/ws` — Not possible as a standard API route since WebSockets need a persistent connection. Instead, we'll use:

**Option:** Client-side simulation with `setInterval` + geometric Brownian motion (current approach, improved). The "server" is simulated in a dedicated module that runs client-side but follows the spec's `simulateNextPrice()` and `simulateSectorMovement()` patterns.

If a true WebSocket server is needed, we can add a custom server script (`server.ts`) that runs alongside Next.js.

### 6.2 Client Hook

```typescript
// hooks/useWebSocket.ts
- Connect (or start simulation)
- Buffer updates in Map<string, PriceUpdate>
- Flush via requestAnimationFrame
- Exponential backoff reconnection (1s, 2s, 4s, 8s, 16s)
- Connection status → Zustand
```

### 6.3 Cell Update Strategy

- Cell components wrapped in `React.memo` with shallow comparison
- Flash animation: `animate-flash-green` / `animate-flash-red` (300ms)
- Only affected cells re-render (selector per symbol)

## 7. API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stocks` | GET | Full stock universe (5000 records), cached 5min |
| `/api/stocks/[symbol]` | GET | Single stock detail |
| `/api/stocks/[symbol]/history` | GET | OHLCV data (252 days) |
| `/api/filters/presets` | GET | Saved filter presets |
| `/api/sectors` | GET | Sector/industry tree |

Response envelope:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: { total: number; page: number; pageSize: number; timestamp: string; executionTimeMs: number; };
  error?: { code: string; message: string; };
}
```

## 8. Tailwind Design System

### Colors (from spec A12.1)

- `brand-{50..900}` — Blue brand palette
- `positive` / `negative` / `warning` — Semantic colors with light/default/dark variants
- `chart.*` — Candle colors, indicator line colors
- Animations: `flash-green`, `flash-red`, `slide-in`

### Component Conventions

- Grid container: `bg-white dark:bg-gray-900 rounded-xl shadow-sm border`
- Header cells: `text-xs font-semibold uppercase tracking-wider text-gray-500`
- Data cells: `text-sm font-mono tabular-nums`
- Focus: `focus-visible:ring-2 focus-visible:ring-brand-500`
- Transitions: `transition-colors duration-150`

### Responsive Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile | < 768px | Single column, filter overlay, simplified grid |
| Tablet | 768-1279px | Collapsible sidebar, chart below grid |
| Desktop | 1280-1535px | Side-by-side grid + chart |
| Wide | ≥ 1536px | Full layout with wider chart |

## 9. Testing Strategy

| Layer | Tool | Coverage Target |
|-------|------|----------------|
| Unit | Vitest | Indicator calculations, filter predicates, cell formatters |
| Component | React Testing Library | DataGrid, FilterPanel, StockChart rendering |
| Performance | Custom benchmarks | Filter < 200ms, Sort < 150ms, Scroll > 55 FPS |

Minimum coverage: 70%

## 10. File Structure

```
src/
├── app/
│   ├── layout.tsx (Server Component)
│   ├── page.tsx (Client Component — screener)
│   ├── api/
│   │   ├── stocks/route.ts
│   │   ├── stocks/[symbol]/route.ts
│   │   ├── stocks/[symbol]/history/route.ts
│   │   ├── filters/presets/route.ts
│   │   └── sectors/route.ts
│   └── globals.css
├── components/
│   ├── ui/ (Button, Input, Select, Toggle — shared primitives)
│   ├── DataGrid/
│   │   ├── DataGrid.tsx
│   │   ├── cells/ (PriceCell, ChangeCell, VolumeCell, etc.)
│   │   └── ColumnHeader.tsx
│   ├── Chart/
│   │   ├── StockChart.tsx
│   │   ├── ChartToolbar.tsx
│   │   └── RSIPane.tsx
│   ├── FilterPanel/
│   │   ├── FilterPanel.tsx (compound component)
│   │   ├── FilterGroup.tsx
│   │   ├── RangeFilter.tsx
│   │   ├── MultiSelectFilter.tsx
│   │   ├── SingleSelectFilter.tsx
│   │   ├── BooleanFilter.tsx
│   │   └── PresetSelector.tsx
│   ├── Layout/
│   │   ├── Header.tsx
│   │   └── ConnectionStatus.tsx
│   └── ErrorBoundary.tsx
├── hooks/
│   ├── useStockScreener.ts
│   ├── useWebSocket.ts
│   ├── useKeyboardNav.ts
│   └── useFilterEngine.ts
├── stores/
│   ├── stockStore.ts
│   └── filterStore.ts (or keep combined)
├── lib/
│   ├── filterEngine.ts (predicate AST + execution)
│   ├── indicators.ts (SMA, EMA, Bollinger, RSI, Volume Profile, MACD)
│   ├── mockDataGenerator.ts
│   ├── priceSimulator.ts (geometric Brownian motion)
│   └── api.ts (fetch helpers)
├── types/
│   └── stock.ts
├── __tests__/
│   ├── indicators/
│   ├── filters/
│   ├── components/
│   └── hooks/
└── test-utils/
    └── mockData.ts
```

## 11. Performance Targets

| Metric | Target |
|--------|--------|
| Filter response (5000 rows) | < 200ms |
| Sort response (5000 rows) | < 150ms |
| Scroll FPS | > 55 FPS |
| LCP | < 2.5s |
| CLS | < 0.1 |
| Memory (5000 rows) | < 150MB |

## 12. Scope (Core Features Only)

**In scope:**
- 5000+ stock mock data with realistic correlations
- 30+ filters with AND logic and presets
- Virtual scrolling DataGrid with 15+ columns
- Candlestick chart with 5 indicators
- WebSocket price simulation with flash animations
- API routes with caching
- Unit + component tests (70% coverage)
- Responsive layout (4 breakpoints)
- Error boundaries
- Performance instrumentation

**Out of scope (sandbox challenges — future):**
- Heatmap view
- Saved screeners to localStorage
- Export to CSV/PDF
- Dark mode toggle
- Keyboard power user mode
- Storybook
- WCAG AA full compliance
