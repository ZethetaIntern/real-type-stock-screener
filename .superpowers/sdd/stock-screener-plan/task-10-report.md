# Task 10 Report: Improve WebSocket Price Simulation

**Status:** Complete
**Commit:** `abeafc6` - `feat(ws): improve price simulation with sector correlation and RAF batching`

## Changes Made

### `frontend/src/lib/stockData.ts`
- Added `simulateSectorMovement()` function (lines 326-347)
- Generates a single sector-wide shock via `normalRandom()`
- Combines sector shock with per-stock idiosyncratic shock using configurable correlation (default 0.6)
- Uses each stock's `beta` to scale volatility (`beta * 0.02`)
- Applies geometric Brownian motion with combined shock
- Returns `Map<string, number>` of symbol -> new price

### `frontend/src/hooks/useWebSocket.ts`
- Replaced `simulateNextPrice` import with `simulateSectorMovement`
- `simulatePriceUpdates` now calls `simulateSectorMovement()` once for the batch of selected stocks
- All stocks in a tick share the same sector shock, creating correlated price movements
- Update count randomized between 10-50 per tick (unchanged)
- RAF batching and exponential backoff reconnection preserved

## Verification
- `next build` compiles successfully with no type errors
- Prices flow through `simulateSectorMovement` -> `pendingUpdates` Map -> RAF flush -> `batchUpdatePrices` -> store -> DataGrid

## Concerns
- None. Implementation is minimal and focused.
