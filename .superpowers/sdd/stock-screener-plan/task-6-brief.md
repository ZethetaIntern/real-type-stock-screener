# Task 6: Expand DataGrid with Full Columns and Cell Renderers

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
- Consumes: `Stock[]` from props, `livePrices` and `watchlist`/`toggleWatchlist` from `useStockStore`

## Cell Renderer Requirements

All cell components must:
- Be wrapped in `React.memo`
- Use `font-mono tabular-nums` for numeric values
- Use `text-positive` for positive values, `text-negative` for negative values
- Use Indian number formatting (Cr/L/K abbreviations)

### PriceCell
```tsx
import { memo } from 'react';

function formatINR(num: number): string {
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const PriceCell = memo(function PriceCell({ value }: { value: number }) {
  return <span className="font-mono tabular-nums">₹{formatINR(value)}</span>;
});
```

### ChangeCell
```tsx
import { memo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

export const ChangeCell = memo(function ChangeCell({ value }: { value: number }) {
  const isPositive = value >= 0;
  return (
    <div className={clsx('flex items-center justify-end gap-1 font-mono tabular-nums', isPositive ? 'text-positive' : 'text-negative')}>
      {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      <span>{isPositive ? '+' : ''}{value.toFixed(2)}%</span>
    </div>
  );
});
```

### VolumeCell
```tsx
import { memo } from 'react';

function formatVolume(num: number): string {
  if (num >= 10000000) return `${(num / 10000000).toFixed(2)}Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(2)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
  return num.toString();
}

export const VolumeCell = memo(function VolumeCell({ value }: { value: number }) {
  return <span className="font-mono tabular-nums text-gray-300">{formatVolume(value)}</span>;
});
```

### MarketCapCell
```tsx
import { memo } from 'react';

function formatMarketCap(num: number): string {
  if (num >= 100000000000) return `₹${(num / 100000000000).toFixed(2)}LCr`;
  if (num >= 1000000000) return `₹${(num / 1000000000).toFixed(2)}Cr`;
  if (num >= 1000000) return `₹${(num / 1000000).toFixed(2)}L`;
  return `₹${num.toFixed(2)}`;
}

export const MarketCapCell = memo(function MarketCapCell({ value }: { value: number }) {
  return <span className="font-mono tabular-nums text-gray-300">{formatMarketCap(value)}</span>;
});
```

### RSICell
```tsx
import { memo } from 'react';
import clsx from 'clsx';

export const RSICell = memo(function RSICell({ value }: { value: number }) {
  let bgColor = 'bg-gray-700';
  if (value < 30) bgColor = 'bg-green-900';
  else if (value > 70) bgColor = 'bg-red-900';
  else bgColor = 'bg-yellow-900';

  return (
    <span className={clsx('px-2 py-1 rounded text-xs font-mono', bgColor)}>
      {value.toFixed(1)}
    </span>
  );
});
```

### WatchlistCell
```tsx
import { memo } from 'react';
import { Star } from 'lucide-react';
import clsx from 'clsx';

interface WatchlistCellProps {
  symbol: string;
  isWatchlisted: boolean;
  onToggle: () => void;
}

export const WatchlistCell = memo(function WatchlistCell({ isWatchlisted, onToggle }: WatchlistCellProps) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className="p-1 hover:bg-gray-700 rounded transition-colors"
    >
      <Star size={16} className={clsx(isWatchlisted ? 'fill-yellow-500 text-yellow-500' : 'text-gray-500')} />
    </button>
  );
});
```

## DataGrid Column Definitions

Expand to 15+ columns:
1. Symbol (with watchlist star, pinned left)
2. Company Name
3. LTP (PriceCell, reads livePrices)
4. % Change (ChangeCell, reads livePrices)
5. Volume (VolumeCell)
6. Market Cap (MarketCapCell)
7. P/E
8. P/B
9. Sector
10. RSI (RSICell)
11. ROE
12. ROCE
13. D/E
14. Dividend Yield
15. Beta
16. Day Change

## Integration with Store

The DataGrid should:
- Read `livePrices` from `useStockStore` for real-time price updates
- Read `watchlist` and `toggleWatchlist` from `useStockStore`
- Read `selectedSymbol` and `setSelectedSymbol` from `useStockStore`
- Call `onRowClick` prop when a row is clicked

## Step: Commit

```bash
git add src/components/DataGrid/
git commit -m "feat(grid): expand DataGrid with 15+ columns and memoized cell renderers"
```
