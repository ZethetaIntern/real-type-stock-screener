# EquityPulse Stock Screener — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Incrementally rework the existing EquityPulse codebase into a production-grade stock screener with 30+ filters, virtual scrolling, 5 chart indicators, and WebSocket price streaming.

**Architecture:** Zustand for client state, React Query for server state, TanStack Table + Virtual for the data grid, Lightweight Charts for candlestick/indicators, client-side price simulation with geometric Brownian motion.

**Tech Stack:** Next.js 14, React 18, TypeScript 5, Zustand, @tanstack/react-query, @tanstack/react-table, @tanstack/react-virtual, lightweight-charts, Tailwind CSS 3, Vitest, @testing-library/react

**Spec:** `docs/superpowers/specs/2026-08-21-stock-screener-design.md`

## Global Constraints

- TypeScript strict mode — no `any` types
- All numeric cells use `font-mono tabular-nums`
- Positive values: `text-positive`, negative: `text-negative`
- All interactive elements: `focus-visible:ring-2 focus-visible:ring-brand-500`
- Transitions: `transition-colors duration-150`
- Commit format: `feat(scope): description` / `fix(scope): description` / `test(scope): description`

---

## Phase 1: Foundation (Tasks 1-3)

### Task 1: Install Dependencies & Update Tailwind Config

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/tailwind.config.ts`

**Interfaces:**
- Produces: Design system tokens available via Tailwind classes (`brand-500`, `positive`, `negative`, `chart.candle.up`, etc.)

- [ ] **Step 1: Install missing dependencies**

```bash
cd frontend
npm install @tanstack/react-query zustand immer
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Verify `lightweight-charts`, `@tanstack/react-table`, `@tanstack/react-virtual` are already installed. If not:
```bash
npm install lightweight-charts @tanstack/react-table @tanstack/react-virtual
```

- [ ] **Step 2: Replace tailwind.config.ts with design system tokens**

Replace `frontend/tailwind.config.ts` with the full design system from spec section A12.1 — brand colors, positive/negative/warning semantic colors, chart colors, flash animations, font families.

- [ ] **Step 3: Verify build still works**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json tailwind.config.ts
git commit -m "chore(deps): install react-query, vitest; add design system tokens to tailwind"
```

---

### Task 2: Create API Routes

**Files:**
- Create: `frontend/src/app/api/stocks/route.ts`
- Create: `frontend/src/app/api/stocks/[symbol]/route.ts`
- Create: `frontend/src/app/api/stocks/[symbol]/history/route.ts`
- Create: `frontend/src/app/api/filters/presets/route.ts`
- Create: `frontend/src/app/api/sectors/route.ts`

**Interfaces:**
- Produces: REST endpoints returning `ApiResponse<T>` envelope
- Consumes: `generateMockStocks()`, `generateOHLCV()` from `lib/stockData.ts`

- [ ] **Step 1: Create stocks list API route** — `GET /api/stocks?page=N&pageSize=N` returns paginated stock universe with 5min cache
- [ ] **Step 2: Create single stock API route** — `GET /api/stocks/[symbol]` returns one stock or 404
- [ ] **Step 3: Create OHLCV history API route** — `GET /api/stocks/[symbol]/history?days=252` returns candle array
- [ ] **Step 4: Create filter presets API route** — `GET /api/filters/presets` returns Value Stocks, Growth Momentum, Large Cap Quality, Technical Breakout presets
- [ ] **Step 5: Create sectors API route** — `GET /api/sectors` returns sector→industry tree
- [ ] **Step 6: Verify all routes return valid JSON** — `npm run dev` then curl each endpoint
- [ ] **Step 7: Commit** — `feat(api): add mock REST endpoints for stocks, history, presets, sectors`

---

### Task 3: Wire Up React Query

**Files:**
- Create: `frontend/src/app/providers.tsx`
- Modify: `frontend/src/app/layout.tsx`
- Create: `frontend/src/lib/api.ts`

**Interfaces:**
- Produces: `QueryClientProvider` wrapping the app, `fetchStocks()`, `fetchStockHistory()`, `fetchFilterPresets()`, `fetchSectors()` helpers
- Consumes: API routes from Task 2

- [ ] **Step 1: Create API fetch helpers** — `lib/api.ts` with typed fetch functions for each endpoint
- [ ] **Step 2: Create providers component** — `'use client'` component with `QueryClientProvider` (staleTime: 5min)
- [ ] **Step 3: Update layout.tsx** — wrap children with `<Providers>`
- [ ] **Step 4: Verify build** — `npm run build`
- [ ] **Step 5: Commit** — `feat(query): add React Query provider and API fetch helpers`

---

## Phase 2: Data Layer (Tasks 4-5)

### Task 4: Rework Filter Engine with Predicate AST

**Files:**
- Modify: `frontend/src/lib/filterEngine.ts`
- Create: `frontend/src/__tests__/filters/filterEngine.test.ts`

**Interfaces:**
- Produces: `filterStocks(stocks: Stock[], filters: FilterConfig[]): Stock[]` and `sortStocks(stocks: Stock[], config: SortConfig): Stock[]`
- Consumes: `Stock`, `FilterConfig`, `SortConfig` from `types/stock.ts`

- [ ] **Step 1: Write failing tests** — 10 tests covering: no filters, gte, between, in, disabled, AND logic, null handling, performance (<200ms for 5000 stocks), sort ascending, sort descending
- [ ] **Step 2: Run tests to verify they fail** — `npx vitest run src/__tests__/filters/filterEngine.test.ts`
- [ ] **Step 3: Rewrite filterEngine.ts** — predicate factory with switch on operator, selectivity ordering, short-circuit AND chain
- [ ] **Step 4: Run tests to verify they pass**
- [ ] **Step 5: Commit** — `feat(filters): rewrite filter engine with predicate AST and short-circuit evaluation`

---

### Task 5: Expand Zustand Store

**Files:**
- Modify: `frontend/src/stores/stockStore.ts`

**Interfaces:**
- Produces: `useStockStore` with `activeFilters: FilterConfig[]`, `addFilter()`, `removeFilter()`, `updateFilter()`, `clearAllFilters()`, `loadPreset()`, `filterPanelOpen`, `chartOpen`
- Consumes: `FilterConfig`, `SortConfig`, `PriceUpdate`, `ConnectionStatus` from types

- [ ] **Step 1: Rewrite stockStore.ts** — replace old `FilterCriteria` with spec-compliant `activeFilters: FilterConfig[]`, add UI state (filterPanelOpen, chartOpen), keep immer + devtools + persist middleware
- [ ] **Step 2: Verify build** — `npm run build`
- [ ] **Step 3: Commit** — `feat(store): expand Zustand store with FilterConfig[] and UI state`

---

## Phase 3: UI Components (Tasks 6-9)

### Task 6: Expand DataGrid with Full Columns and Cell Renderers

**Files:**
- Modify: `frontend/src/components/DataGrid/DataGrid.tsx`
- Create: `frontend/src/components/DataGrid/cells/PriceCell.tsx`
- Create: `frontend/src/components/DataGrid/cells/ChangeCell.tsx`
- Create: `frontend/src/components/DataGrid/cells/VolumeCell.tsx`
- Create: `frontend/src/components/DataGrid/cells/MarketCapCell.tsx`
- Create: `frontend/src/components/DataGrid/cells/RSICell.tsx`
- Create: `frontend/src/components/DataGrid/cells/WatchlistCell.tsx`

**Interfaces:**
- Produces: DataGrid component with 15+ columns, virtual scrolling, sorting, cell-level memoization
- Consumes: `Stock[]` from `useStockScreener` hook, `livePrices` from store

- [ ] **Step 1: Create cell renderer components** — each wrapped in `React.memo`, using design system colors (`text-positive`, `text-negative`, `font-mono tabular-nums`)
- [ ] **Step 2: Expand column definitions** — Symbol (pinned), Company, LTP, % Chg, Volume, Market Cap, P/E, P/B, Sector, RSI, ROE, ROCE, D/E, Dividend Yield, Beta, Day Change
- [ ] **Step 3: Add live price integration** — cells read `livePrices.get(symbol)` for real-time updates
- [ ] **Step 4: Add flash animations** — `animate-flash-green` / `animate-flash-red` on price change
- [ ] **Step 5: Verify DataGrid renders 5000 rows smoothly** — `npm run dev`, check scroll FPS
- [ ] **Step 6: Commit** — `feat(grid): expand DataGrid with 15+ columns and memoized cell renderers`

---

### Task 7: Build FilterPanel Compound Component

**Files:**
- Create: `frontend/src/components/FilterPanel/FilterPanel.tsx`
- Create: `frontend/src/components/FilterPanel/FilterGroup.tsx`
- Create: `frontend/src/components/FilterPanel/RangeFilter.tsx`
- Create: `frontend/src/components/FilterPanel/MultiSelectFilter.tsx`
- Create: `frontend/src/components/FilterPanel/SingleSelectFilter.tsx`
- Create: `frontend/src/components/FilterPanel/BooleanFilter.tsx`
- Create: `frontend/src/components/FilterPanel/PresetSelector.tsx`
- Create: `frontend/src/components/FilterPanel/ActiveFilterChips.tsx`

**Interfaces:**
- Produces: FilterPanel with 30+ filters grouped in accordion sections, preset loading, active filter chips
- Consumes: `useStockStore` (activeFilters, addFilter, removeFilter, clearAllFilters, loadPreset), `fetchFilterPresets()` from React Query

- [ ] **Step 1: Build RangeFilter** — dual-handle slider with min/max numeric inputs, debounced (300ms)
- [ ] **Step 2: Build MultiSelectFilter** — checkbox dropdown with search for Sector, Industry, Market Cap Category, Index
- [ ] **Step 3: Build SingleSelectFilter** — radio group for MACD Signal, Price vs SMA, Bollinger Position, Volume vs Avg
- [ ] **Step 4: Build BooleanFilter** — toggle switch for Watchlist Only
- [ ] **Step 5: Build FilterGroup** — collapsible accordion section with header and children
- [ ] **Step 6: Build ActiveFilterChips** — removable badges showing active filters, with count
- [ ] **Step 7: Build PresetSelector** — dropdown to load preset filter configurations
- [ ] **Step 8: Assemble FilterPanel** — compose all groups: Fundamentals (12 filters), Market Data (7), Classification (4), Technical (7), Custom (1)
- [ ] **Step 9: Wire to store** — connect to `useStockStore` actions
- [ ] **Step 10: Verify filter count** — "Showing X of 5,000 stocks" updates in real time
- [ ] **Step 11: Commit** — `feat(filters): build compound FilterPanel with 30+ filter controls`

---

### Task 8: Improve StockChart with RSI Pane and Volume Profile

**Files:**
- Modify: `frontend/src/components/Chart/StockChart.tsx`
- Create: `frontend/src/components/Chart/ChartToolbar.tsx`

**Interfaces:**
- Produces: Chart with candlestick + 5 indicators (SMA, EMA, Bollinger, RSI sub-pane, Volume Profile), timeframe switching
- Consumes: `generateOHLCV()` for data, `calculateSMA/EMA/Bollinger/RSI/VolumeProfile` from `lib/indicators.ts`, `livePrices` for real-time updates

- [ ] **Step 1: Add RSI sub-chart pane** — separate Lightweight Charts instance below main chart with overbought (70) / oversold (30) reference lines
- [ ] **Step 2: Add Volume Profile overlay** — horizontal histogram on right side of chart, recalculates on zoom/pan
- [ ] **Step 3: Build ChartToolbar** — indicator toggle buttons, timeframe selector (1D/1W/1M/3M/1Y/5Y)
- [ ] **Step 4: Add real-time candle updates** — subscribe to `livePrices` for selected symbol, update last candle
- [ ] **Step 5: Add responsive resize** — ResizeObserver on container
- [ ] **Step 6: Verify all 5 indicators render correctly**
- [ ] **Step 7: Commit** — `feat(chart): add RSI pane, Volume Profile, and timeframe switching`

---

### Task 9: Build Layout with Responsive Breakpoints

**Files:**
- Create: `frontend/src/components/Layout/Header.tsx`
- Create: `frontend/src/components/Layout/ConnectionStatus.tsx`
- Modify: `frontend/src/app/page.tsx`

**Interfaces:**
- Produces: Responsive layout with header, collapsible filter sidebar, grid, chart panel
- Consumes: `useStockStore` (connectionStatus, filterPanelOpen, chartOpen, selectedSymbol)

- [ ] **Step 1: Build Header** — logo, global search, connection status indicator, filter/chart toggle buttons
- [ ] **Step 2: Build ConnectionStatus** — green/yellow/red dot with tooltip
- [ ] **Step 3: Restructure page.tsx** — responsive grid layout: mobile (stacked), tablet (collapsible sidebar), desktop (side-by-side), wide (full)
- [ ] **Step 4: Add filter panel toggle** — slide-in animation on mobile, sidebar on desktop
- [ ] **Step 5: Add chart panel** — appears on row click, 40% width on desktop, full-width overlay on mobile
- [ ] **Step 6: Verify responsive behavior** at 375px, 768px, 1280px, 1536px
- [ ] **Step 7: Commit** — `feat(layout): responsive layout with header, filter sidebar, and chart panel`

---

## Phase 4: Real-time (Tasks 10-11)

### Task 10: Improve WebSocket Price Simulation

**Files:**
- Modify: `frontend/src/hooks/useWebSocket.ts`
- Modify: `frontend/src/lib/stockData.ts` (priceSimulator functions)

**Interfaces:**
- Produces: `useWebSocket()` hook with RAF-batched updates, exponential backoff, connection status
- Consumes: `simulateNextPrice()` with geometric Brownian motion, `useStockStore.batchUpdatePrices()`

- [ ] **Step 1: Improve price simulator** — add `simulateSectorMovement()` for correlated sector shocks, use Box-Muller transform
- [ ] **Step 2: Rewrite useWebSocket hook** — buffer updates in `Map<string, PriceUpdate>`, flush via `requestAnimationFrame`, exponential backoff reconnection (1s/2s/4s/8s/16s)
- [ ] **Step 3: Add connection status to store** — update `connectionStatus` on connect/disconnect/reconnect
- [ ] **Step 4: Verify price updates flow** — prices update in DataGrid cells, flash animations trigger
- [ ] **Step 5: Commit** — `feat(ws): improve price simulation with sector correlation and RAF batching`

---

### Task 11: Cell-Level Real-Time Updates

**Files:**
- Modify: `frontend/src/components/DataGrid/cells/PriceCell.tsx`
- Modify: `frontend/src/components/DataGrid/cells/ChangeCell.tsx`

**Interfaces:**
- Produces: Cells that re-render only when their specific value changes, with flash animation
- Consumes: `useStockStore(s => s.livePrices.get(symbol))` selector

- [ ] **Step 1: Add per-symbol selector** — `useStockStore(s => s.livePrices.get(symbol))` instead of reading entire livePrices map
- [ ] **Step 2: Add flash animation** — on price change, apply `animate-flash-green` or `animate-flash-red` class for 300ms
- [ ] **Step 3: Verify with React DevTools Profiler** — only changed cells re-render during price updates
- [ ] **Step 4: Commit** — `perf(grid): cell-level memoization with per-symbol price selectors`

---

## Phase 5: Polish & Testing (Tasks 12-14)

### Task 12: Indicator and Utility Unit Tests

**Files:**
- Create: `frontend/src/__tests__/indicators/sma.test.ts`
- Create: `frontend/src/__tests__/indicators/ema.test.ts`
- Create: `frontend/src/__tests__/indicators/bollinger.test.ts`
- Create: `frontend/src/__tests__/indicators/rsi.test.ts`
- Create: `frontend/src/__tests__/indicators/volumeProfile.test.ts`

**Interfaces:**
- Produces: Test suite validating indicator math against known values from spec appendix B1-B5

- [ ] **Step 1: Write SMA tests** — verify against spec verification data: `[100,102,104,103,105,107,106,108,110,109]` SMA(5) from index 4 = `[102.8,104.2,105.0,105.8,107.2,108.0]`
- [ ] **Step 2: Write EMA tests** — verify EMA(5) at index 5 = 104.20 (k=0.3333)
- [ ] **Step 3: Write Bollinger tests** — verify population standard deviation (divide by n, not n-1)
- [ ] **Step 4: Write RSI tests** — verify edge cases: AvgLoss=0 → RSI=100, AvgGain=0 → RSI=0
- [ ] **Step 5: Write Volume Profile tests** — verify bucket distribution
- [ ] **Step 6: Run all indicator tests** — `npx vitest run src/__tests__/indicators/`
- [ ] **Step 7: Commit** — `test(indicators): add unit tests for SMA, EMA, Bollinger, RSI, Volume Profile`

---

### Task 13: Error Boundaries

**Files:**
- Create: `frontend/src/components/ErrorBoundary.tsx`
- Modify: `frontend/src/app/page.tsx` (wrap feature areas)

**Interfaces:**
- Produces: ErrorBoundary component with fallback UI, wraps DataGrid, FilterPanel, Chart independently

- [ ] **Step 1: Create ErrorBoundary class component** — catches errors, renders fallback with error message and retry button
- [ ] **Step 2: Wrap DataGrid** in ErrorBoundary
- [ ] **Step 3: Wrap FilterPanel** in ErrorBoundary
- [ ] **Step 4: Wrap StockChart** in ErrorBoundary
- [ ] **Step 5: Verify** — trigger an error in one area, confirm others still work
- [ ] **Step 6: Commit** — `feat(ui): add error boundaries for DataGrid, FilterPanel, Chart`

---

### Task 14: useStockScreener Hook Update and Integration

**Files:**
- Modify: `frontend/src/hooks/useStockScreener.ts`

**Interfaces:**
- Produces: `useStockScreener()` returning `{ stocks, totalCount, filteredCount, filterExecutionTime, updateSearch }`
- Consumes: React Query for stock data, Zustand for filters/sort, `filterStocks()` + `sortStocks()` from filter engine

- [ ] **Step 1: Rewrite useStockScreener** — fetch stocks via React Query, apply `filterStocks(stocks, activeFilters)` + `sortStocks(filtered, sortConfig)` in `useMemo`, track execution time
- [ ] **Step 2: Wire to page.tsx** — replace direct `mockStocks` usage with `useStockScreener()`
- [ ] **Step 3: Verify filter → grid flow** — change filters, grid updates, execution time displayed
- [ ] **Step 4: Commit** — `feat(screener): wire useStockScreener with React Query and predicate filter engine`

---

## Verification Checklist

After all tasks, verify:

- [ ] `npm run build` succeeds
- [ ] `npx vitest run` — all tests pass
- [ ] 5000 stocks render in DataGrid with smooth scrolling
- [ ] 30+ filters work with AND logic
- [ ] Filter response < 200ms (check `filterExecutionTime` display)
- [ ] Candlestick chart renders with all 5 indicators
- [ ] Price updates flow: WebSocket → store → cell flash
- [ ] Responsive layout works at all 4 breakpoints
- [ ] Error boundaries catch and isolate component failures
- [ ] Connection status indicator shows correct state
