# Task 10: Improve WebSocket Price Simulation

**Files:**
- Modify: `frontend/src/hooks/useWebSocket.ts`
- Modify: `frontend/src/lib/stockData.ts` (priceSimulator functions)

**Interfaces:**
- Produces: `useWebSocket()` hook with RAF-batched updates, exponential backoff, connection status
- Consumes: `simulateNextPrice()` with geometric Brownian motion, `useStockStore.batchUpdatePrices()`

## Current State

The existing `useWebSocket.ts` already has:
- Client-side simulation with setInterval
- RAF-based batching
- Exponential backoff reconnection
- Connection status updates

## What to Improve

### 1. Add Sector Correlation

Add `simulateSectorMovement()` to `stockData.ts`:

```typescript
export function simulateSectorMovement(
  stocks: Stock[],
  sectorCorrelation: number = 0.6
): Map<string, number> {
  const sectorShock = normalRandom();
  const updates = new Map<string, number>();

  for (const stock of stocks) {
    const idiosyncratic = normalRandom();
    const combinedShock = sectorCorrelation * sectorShock +
      Math.sqrt(1 - sectorCorrelation ** 2) * idiosyncratic;
    const newPrice = simulateNextPrice(stock.lastPrice, stock.beta * 0.02);
    updates.set(stock.symbol, newPrice);
  }

  return updates;
}
```

### 2. Improve Price Updates

Update `useWebSocket.ts` to:
- Use sector-correlated movements
- Update 10-50 stocks per tick (randomized)
- Buffer updates in Map, flush via RAF
- Track connection status in store

### 3. Verify

- Prices update in DataGrid cells
- Flash animations trigger on price change
- Connection status indicator shows correct state

## Step: Commit

```bash
git add src/hooks/useWebSocket.ts src/lib/stockData.ts
git commit -m "feat(ws): improve price simulation with sector correlation and RAF batching"
```
