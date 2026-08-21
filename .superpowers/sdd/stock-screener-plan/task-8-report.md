# Task 8 Report: Improve StockChart with RSI Pane and Volume Profile

**Status:** ✅ Complete

**Commit:** `e671caa` - `feat(chart): add RSI pane, Volume Profile, and timeframe switching`

## Files Modified/Created

| File | Action | Description |
|------|--------|-------------|
| `frontend/src/components/Chart/ChartToolbar.tsx` | Created | New toolbar component with indicator toggles and timeframe selector |
| `frontend/src/components/Chart/StockChart.tsx` | Rewritten | Added RSI sub-pane, Volume Profile, timeframe switching, updated to lightweight-charts v5 API |
| `frontend/src/lib/indicators.ts` | Fixed | Fixed TypeScript error in MACD calculation (line 208) |

## What Was Implemented

### 1. RSI Sub-Chart Pane
- Separate Lightweight Charts instance below main chart (150px height)
- Overbought line at 70 (dashed red)
- Oversold line at 30 (dashed green)
- Midline at 50 (dashed gray)
- RSI line in purple (#8B5CF6)
- Time scale synced with main chart (bidirectional)

### 2. Volume Profile Overlay
- Uses `calculateVolumeProfile()` from `lib/indicators.ts`
- Renders as horizontal price lines on the main chart
- Opacity and thickness vary by volume intensity
- Recalculates on chart rebuild (visible range aware)

### 3. ChartToolbar Component
- 5 indicator toggle buttons: SMA, EMA, Bollinger, RSI, Volume Profile
- Timeframe selector: 1D, 1W, 1M, 3M, 1Y, 5Y
- Active state uses design system colors (blue, cyan, purple, violet, amber)
- Hover states on inactive buttons

### 4. Timeframe Switching
- Maps timeframes to day counts: 1D→1, 1W→5, 1M→22, 3M→66, 1Y→252, 5Y→1260
- Regenerates OHLCV data on timeframe change
- Recalculates all enabled indicators
- Chart height adjusts (350px with RSI, 500px without)

### 5. API Migration
- Updated from deprecated `addCandlestickSeries()` to `addSeries(CandlestickSeries, ...)`
- Updated from deprecated `addLineSeries()` to `addSeries(LineSeries, ...)`
- Updated from deprecated `addHistogramSeries()` to `addSeries(HistogramSeries, ...)`

## TypeScript Status
- All chart-related files compile cleanly
- Pre-existing errors in `page.tsx`, `DataGrid.tsx`, `StockTable.tsx`, `stockStore.ts` are unrelated to this task

## Build Status
- Chart components compile successfully
- Full build fails due to pre-existing issues in `page.tsx` (missing `mockStocks`/`filterStocks` exports)

## Concerns
- Volume Profile rendering uses `createPriceLine` which adds lines to the price scale; a more sophisticated approach would use a custom plugin or canvas overlay for true horizontal bars
- The `lineWidth` type cast (`as 1 | 2 | 3 | 4`) is needed because Lightweight Charts restricts line width to these values
- RSI chart time sync uses a 50ms debounce to avoid infinite loops
