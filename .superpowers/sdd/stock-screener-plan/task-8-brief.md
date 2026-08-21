# Task 8: Improve StockChart with RSI Pane and Volume Profile

**Files:**
- Modify: `frontend/src/components/Chart/StockChart.tsx`
- Create: `frontend/src/components/Chart/ChartToolbar.tsx`

**Interfaces:**
- Produces: Chart with candlestick + 5 indicators (SMA, EMA, Bollinger, RSI sub-pane, Volume Profile), timeframe switching
- Consumes: `generateOHLCV()` for data, `calculateSMA/EMA/Bollinger/RSI/VolumeProfile` from `lib/indicators.ts`, `livePrices` for real-time updates

## Current State

The existing `StockChart.tsx` has:
- Candlestick series via Lightweight Charts
- SMA (20, 50) toggle
- EMA (12, 26) toggle
- Bollinger Bands toggle
- RSI toggle (button exists but RSI sub-pane not implemented)
- Real-time candle updates from livePrices

## What to Add

### 1. RSI Sub-Chart Pane

Add a separate Lightweight Charts instance below the main chart for RSI:
- Overbought line at 70 (dashed)
- Oversold line at 30 (dashed)
- RSI line in purple (#8B5CF6)
- Height: 150px
- Synced time scale with main chart

### 2. Volume Profile Overlay

Add horizontal histogram on the right side of the main chart showing volume distribution at each price level:
- Use `calculateVolumeProfile()` from `lib/indicators.ts`
- Render as horizontal bars using Lightweight Charts markers or custom rendering
- Recalculate on zoom/pan (visible range change)

### 3. ChartToolbar Component

Create a toolbar component with:
- Indicator toggle buttons (SMA, EMA, Bollinger, RSI, Volume Profile)
- Timeframe selector (1D, 1W, 1M, 3M, 1Y, 5Y)
- Each button uses design system colors

### 4. Timeframe Switching

When timeframe changes:
- Regenerate OHLCV data with appropriate number of days
- Recalculate all enabled indicators
- Update chart data

## Step: Commit

```bash
git add src/components/Chart/
git commit -m "feat(chart): add RSI pane, Volume Profile, and timeframe switching"
```
