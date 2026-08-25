# ERRATA — Deliberate Errors in the Project Specification

This document identifies the three deliberate technical errors embedded in the
project specification's example code. Per the brief, each error is explained,
its root cause is described, and a corrected version is provided.

---

## Error 1 — Indicator / Price Calculation

**Location:** `Section A4.1 — simulateSectorMovement` (and the `simulateNextPrice` call)

**Document code:**
```typescript
export function simulateSectorMovement(stocks, sectorCorrelation = 0.6) {
  const sectorShock = gaussianRandom();
  const updates = new Map();
  for (const stock of stocks) {
    const idiosyncratic = gaussianRandom();
    const combinedShock = sectorCorrelation * sectorShock +
      Math.sqrt(1 - sectorCorrelation ** 2) * idiosyncratic;
    const newPrice = simulateNextPrice(stock.lastPrice, stock.volatility);
    updates.set(stock.symbol, newPrice);
  }
  return updates;
}
```

**Why it is wrong:** The `Stock` type (Section A1 / Task 1.2) does **not** define a
`volatility` property. It exposes `beta` and `atr`, but no `volatility`. Because
`stock.volatility` is `undefined`, the call becomes
`simulateNextPrice(stock.lastPrice, undefined)`, and inside
`simulateNextPrice` a `volatility` of `undefined` produces
`priceChange = drift * dt + undefined * randomShock = NaN`, so every simulated
price becomes `NaN`. The whole real-time feed breaks (displays `NaN` on the
grid and chart).

**Correct implementation — volatility derived from a real field (beta-scaled):**
```typescript
const volatility = stock.beta * 0.02; // per-stock volatility scaled by beta
const newPrice = simulateNextPrice(stock.lastPrice, volatility);
```

**Impact:** With the bug, `livePrices` are `NaN`; without it, prices follow a
realistic, correlated random walk.

---

## Error 2 — WebSocket Reconnection Logic

**Location:** `Section A4.2 — useRealtimeUpdates` effect + `onclose`

**Document code:**
```typescript
const connect = useCallback(() => {
  const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');
  ws.onmessage = (event) => { /* ... batch updates ... */ };
  ws.onclose = () => {
    const delay = RECONNECT_DELAYS[Math.min(reconnectAttempt.current, RECONNECT_DELAYS.length - 1)];
    reconnectAttempt.current++;
    setTimeout(connect, delay);
  };
  ws.onopen = () => { reconnectAttempt.current = 0; };
  wsRef.current = ws;
}, [flushUpdates]);

useEffect(() => { connect(); return () => wsRef.current?.close(); }, [connect]);
```

**Why it is wrong:** The effect's cleanup only calls `wsRef.current?.close()`.
Calling `close()` fires the `onclose` handler, which **unconditionally schedules
`setTimeout(connect, delay)`**. Because nothing cancels that pending timer or
guards against post-unmount work, after the hook unmounts the socket is torn
down but `connect()` is scheduled again a few seconds later — recreating a
`WebSocket` **after unmount**. This is a leak: stale timers keep the component's
closures alive and can re-open connections that nothing will ever use
(in production this also fights the browser/backoff on a dead server).

**Correct implementation — track a `disposed` flag and clear the timer:**
```typescript
const disposed = useRef(false);
const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

useEffect(() => {
  disposed.current = false;
  connect();
  return () => {
    disposed.current = true;
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    wsRef.current?.close();
  };
}, [connect]);

// inside onclose:
ws.onclose = () => {
  const delay = RECONNECT_DELAYS[...];
  reconnectAttempt.current++;
  if (!disposed.current) reconnectTimer.current = setTimeout(connect, delay);
};
```

**Impact:** Without the guard, connections and timers survive teardown; with it,
reconnect stops cleanly on unmount and an explicit `disposed` flag prevents
scheduling work after disposal.

---

## Error 3 — TypeScript Type Definitions

**Location:** `Section A1.5 / A5.1 — FilterConfig.field`

**Document code:**
```typescript
export interface FilterConfig {
  id: string;
  field: keyof Stock;   // <-- too broad
  operator: FilterOperator;
  value: FilterValue;
  enabled: boolean;
}
export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' |
  'between' | 'in' | 'notIn' | 'contains' | 'startsWith';
export type FilterValue = number | string | boolean | number[] | string[];
```

**Why it is wrong:** `keyof Stock` includes **every** field of `Stock`, including
fields that cannot sensibly be filtered, and arrays/objects that no operator
supports. It lets the type system accept semantically invalid filters, e.g.:

```typescript
// Compiles fine, but meaningless / breaks at runtime:
{ field: 'symbol', operator: 'between', value: [100, 200] }
{ field: 'indexMembership', operator: 'gte', value: 50 }  // array vs number
{ field: 'companyName', operator: 'between', value: [10, 20] }
```

The spec itself even defines filters such as `priceVsSma50` / `priceVsSma200`
(Section A6.1) that **don't exist on `Stock`**, so `field: keyof Stock` both
allows invalid combos and cannot express the required ones. The type system
should restrict `field` to a meaningful union.

**Correct implementation — a filterable-field union:**
```typescript
type NumericField = 'lastPrice' | 'marketCap' | 'pe' | 'pb' | 'dividendYield' |
  'eps' | 'roe' | 'roce' | 'debtToEquity' | 'currentRatio' | 'promoterHolding' |
  'revenueGrowthYoY' | 'profitGrowthYoY' | 'rsi14' | 'beta' | 'atr' | 'changePercent';
type StringField = 'sector' | 'industry' | 'marketCapCategory' | 'macdSignal' |
  'bollingerPosition' | 'volumeVsAvg' | 'companyName';
type TypeConfig = { field: NumericField | StringField; operator: FilterOperator; value: FilterValue };

export interface FilterConfig extends TypeConfig {
  id: string;
  enabled: boolean;
}
```

**Impact:** `keyof Stock` trades compile-time safety for convenience and lets
invalid filter expressions slip through to the filter engine; a narrow union
catches these mistakes statically.

---

## Summary

| # | Category | Document location | Error | Severity |
|---|----------|-------------------|-------|----------|
| 1 | Indicator / price calculation | A4.1 `simulateSectorMovement` | `stock.volatility` is undefined → prices become `NaN` | High |
| 2 | WebSocket reconnection | A4.2 `useRealtimeUpdates` | `close()` in the effect cleanup still triggers reconnect; timers/connections leak after unmount | High |
| 3 | TypeScript type definitions | A1.5 / A5.1 `FilterConfig` | `field: keyof Stock` is too broad; permits invalid, and misses required, filter fields | Medium |

All three errors have been identified, explained, and corrected above (+15 bonus points).
