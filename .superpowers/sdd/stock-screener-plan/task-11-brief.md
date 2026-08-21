# Task 11: Cell-Level Real-Time Updates

**Files:**
- Modify: `frontend/src/components/DataGrid/cells/PriceCell.tsx`
- Modify: `frontend/src/components/DataGrid/cells/ChangeCell.tsx`

**Interfaces:**
- Produces: Cells that re-render only when their specific value changes, with flash animation
- Consumes: `useStockStore(s => s.livePrices.get(symbol))` selector

## What to Do

### 1. Add Per-Symbol Selector

Instead of reading the entire `livePrices` map, each cell should use a per-symbol selector:

```tsx
const livePrice = useStockStore(s => s.livePrices.get(symbol));
```

This ensures the cell only re-renders when its specific symbol's price changes.

### 2. Add Flash Animation

When the price changes, apply a flash animation:
- Green flash (`animate-flash-green`) for price increase
- Red flash (`animate-flash-red`) for price decrease
- Animation lasts 300ms

```tsx
import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';

export const PriceCell = memo(function PriceCell({ value, symbol }: { value: number; symbol: string }) {
  const livePrice = useStockStore(s => s.livePrices.get(symbol));
  const price = livePrice?.price ?? value;
  const [flashClass, setFlashClass] = useState('');
  const prevPrice = useRef(price);

  useEffect(() => {
    if (price > prevPrice.current) {
      setFlashClass('animate-flash-green');
    } else if (price < prevPrice.current) {
      setFlashClass('animate-flash-red');
    }
    prevPrice.current = price;
    const timer = setTimeout(() => setFlashClass(''), 300);
    return () => clearTimeout(timer);
  }, [price]);

  return (
    <span className={clsx('font-mono tabular-nums', flashClass)}>
      ₹{formatINR(price)}
    </span>
  );
});
```

### 3. Verify with React DevTools Profiler

- Open React DevTools Profiler
- Record while prices are updating
- Confirm only changed cells re-render, not entire rows

## Step: Commit

```bash
git add src/components/DataGrid/cells/
git commit -m "perf(grid): cell-level memoization with per-symbol price selectors"
```
