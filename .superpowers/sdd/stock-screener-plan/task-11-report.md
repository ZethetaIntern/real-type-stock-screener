# Task 11: Cell-Level Real-Time Updates — Report

**Status:** ✅ Complete

**Commit:** `c3222b1` — `perf(grid): cell-level memoization with per-symbol price selectors`

## Changes Made

### `PriceCell.tsx`
- Added `symbol` prop
- Uses per-symbol selector: `useStockStore(s => s.livePrices.get(symbol))`
- Added flash animation: green on price increase, red on price decrease (300ms)
- Tracks previous price via `useRef` to detect direction

### `ChangeCell.tsx`
- Added `symbol` prop
- Uses per-symbol selector: `useStockStore(s => s.livePrices.get(symbol))`
- Added flash animation on changePercent updates (same green/red logic)
- Tracks previous change via `useRef`

### `DataGrid.tsx`
- PriceCell and ChangeCell column definitions no longer read `livePrices` at the column level
- Cells receive `symbol` and static fallback `value` — they subscribe to the store directly
- `livePrices` still used by `changeAbsolute` column (inline, not a cell component)

## Performance Impact

- **Before:** Any price update caused `columns` useMemo to recalculate (since `livePrices` was a dependency), re-rendering all visible cells via `flexRender`
- **After:** PriceCell and ChangeCell subscribe to per-symbol selectors — only cells whose symbol's price changed re-render. The `columns` array for those two columns is now stable across price updates.

## Verification

- `npm run build` passes cleanly
- Flash animations use existing Tailwind keyframes (`flashGreen`, `flashRed`) already defined in `tailwind.config.ts`

## Concerns

- The `changeAbsolute` column in DataGrid.tsx still reads `livePrices` at the column level (line ~197). This could be extracted into its own cell component in a follow-up task for full cell-level isolation.
- ESLint is not configured in the project — skipped lint check.
