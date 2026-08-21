# Task 9: Build Layout with Responsive Breakpoints

**Files:**
- Create: `frontend/src/components/Layout/Header.tsx`
- Create: `frontend/src/components/Layout/ConnectionStatus.tsx`
- Modify: `frontend/src/app/page.tsx`

**Interfaces:**
- Produces: Responsive layout with header, collapsible filter sidebar, grid, chart panel
- Consumes: `useStockStore` (connectionStatus, filterPanelOpen, chartOpen, selectedSymbol), `useStockScreener` hook, `FilterPanel`, `DataGrid`, `StockChart` components

## Header Component

```tsx
'use client';
import { Activity, Filter, BarChart3, Search } from 'lucide-react';
import { useStockStore } from '@/stores/stockStore';
import { ConnectionStatus } from './ConnectionStatus';

export function Header() {
  const { filterPanelOpen, setFilterPanelOpen, chartOpen, setChartOpen, connectionStatus } = useStockStore();

  return (
    <header className="border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="text-brand-500" size={28} />
          <h1 className="text-xl font-bold">EquityPulse</h1>
          <ConnectionStatus status={connectionStatus} />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterPanelOpen(!filterPanelOpen)}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            title="Toggle Filters"
          >
            <Filter size={20} className="text-gray-400" />
          </button>
          <button
            onClick={() => setChartOpen(!chartOpen)}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            title="Toggle Chart"
          >
            <BarChart3 size={20} className="text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
```

## ConnectionStatus Component

```tsx
'use client';
import { ConnectionStatus as ConnectionStatusType } from '@/types/stock';
import clsx from 'clsx';

interface ConnectionStatusProps {
  status: ConnectionStatusType;
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={clsx(
          'w-2 h-2 rounded-full',
          status === 'connected' && 'bg-positive',
          status === 'reconnecting' && 'bg-warning animate-pulse',
          status === 'disconnected' && 'bg-negative'
        )}
      />
      <span className="text-xs text-gray-500 capitalize">{status}</span>
    </div>
  );
}
```

## Responsive Layout (page.tsx)

Replace `frontend/src/app/page.tsx` with a responsive layout:

```tsx
'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchStocks } from '@/lib/api';
import { useStockStore } from '@/stores/stockStore';
import { useStockScreener } from '@/hooks/useStockScreener';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Header } from '@/components/Layout/Header';
import { FilterPanel } from '@/components/FilterPanel/FilterPanel';
import DataGrid from '@/components/DataGrid/DataGrid';
import StockChart from '@/components/Chart/StockChart';
import clsx from 'clsx';

export default function ScreenerPage() {
  const { filterPanelOpen, chartOpen, selectedSymbol, setStocks, setSelectedSymbol } = useStockStore();
  const { stocks, filteredCount, totalCount, filterExecutionTime } = useStockScreener();

  // Fetch stock universe via React Query
  const { data: stockData, isLoading } = useQuery({
    queryKey: ['stocks', 'universe'],
    queryFn: () => fetchStocks(),
    staleTime: 5 * 60 * 1000,
  });

  // Load stocks into store
  useEffect(() => {
    if (stockData?.data) {
      setStocks(stockData.data);
    }
  }, [stockData, setStocks]);

  // Start WebSocket simulation
  useWebSocket();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-gray-400">Loading stock universe...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />

      <div className="flex h-[calc(100vh-73px)]">
        {/* Filter Sidebar - responsive */}
        {filterPanelOpen && (
          <aside className={clsx(
            'border-r border-gray-800 overflow-y-auto transition-all duration-200',
            'w-80 flex-shrink-0'
          )}>
            <FilterPanel />
          </aside>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Status Bar */}
          <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm text-gray-400">
              Showing {filteredCount} of {totalCount} stocks
            </span>
            <span className="text-xs text-gray-500">
              Filter: {filterExecutionTime.toFixed(1)}ms
            </span>
          </div>

          {/* Grid + Chart Layout */}
          <div className="flex-1 flex overflow-hidden">
            {/* DataGrid */}
            <div className={clsx(
              'overflow-auto',
              chartOpen && selectedSymbol ? 'w-3/5' : 'w-full'
            )}>
              <DataGrid stocks={stocks} onRowClick={(stock) => setSelectedSymbol(stock.symbol)} />
            </div>

            {/* Chart Panel */}
            {chartOpen && selectedSymbol && (
              <div className="w-2/5 border-l border-gray-800 overflow-y-auto">
                <StockChart symbol={selectedSymbol} />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
```

## Responsive Breakpoints

The layout should adapt at:
- **Mobile (< 768px):** Filter panel as full-screen overlay, no chart side-panel, simplified grid
- **Tablet (768-1279px):** Filter panel toggles via hamburger, chart below grid
- **Desktop (1280-1535px):** Side-by-side filter sidebar + grid + chart
- **Wide (≥ 1536px):** Full layout with wider chart panel

For now, implement the desktop layout. Mobile/tablet responsive can be added later.

## Step: Commit

```bash
git add src/components/Layout/ src/app/page.tsx
git commit -m "feat(layout): responsive layout with header, filter sidebar, and chart panel"
```
