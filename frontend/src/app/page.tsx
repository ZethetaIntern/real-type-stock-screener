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
import { ErrorBoundary } from '@/components/ErrorBoundary';
import clsx from 'clsx';

export default function ScreenerPage() {
  const { filterPanelOpen, chartOpen, selectedSymbol, setStocks, setSelectedSymbol } = useStockStore();
  const { stocks, filteredCount, totalCount, filterExecutionTime } = useStockScreener();

  const { data: stockData, isLoading } = useQuery({
    queryKey: ['stocks', 'universe'],
    queryFn: () => fetchStocks(),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (stockData?.data) {
      setStocks(stockData.data);
    }
  }, [stockData, setStocks]);

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
        {filterPanelOpen && (
          <aside className={clsx(
            'border-r border-gray-800 overflow-y-auto transition-all duration-200',
            'w-80 flex-shrink-0'
          )}>
            <ErrorBoundary name="Filter Panel">
              <FilterPanel />
            </ErrorBoundary>
          </aside>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm text-gray-400">
              Showing {filteredCount} of {totalCount} stocks
            </span>
            <span className="text-xs text-gray-500">
              Filter: {filterExecutionTime.toFixed(1)}ms
            </span>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className={clsx(
              'overflow-auto',
              chartOpen && selectedSymbol ? 'w-3/5' : 'w-full'
            )}>
              <ErrorBoundary name="Data Grid">
                <DataGrid stocks={stocks} onRowClick={(stock) => setSelectedSymbol(stock.symbol)} />
              </ErrorBoundary>
            </div>

            {chartOpen && selectedSymbol && (
              <div className="w-2/5 border-l border-gray-800 overflow-y-auto">
                <ErrorBoundary name="Stock Chart">
                  <StockChart symbol={selectedSymbol} />
                </ErrorBoundary>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
