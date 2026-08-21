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
  const { filterPanelOpen, chartOpen, selectedSymbol, setStocks, setSelectedSymbol, activeFilters } = useStockStore();
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
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-gray-400">Loading stock universe...</div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Header />

      <div className="flex h-[calc(100vh-57px)]">
        {/* Filter Sidebar */}
        {filterPanelOpen && (
          <aside className="w-80 flex-shrink-0 border-r border-gray-800/50 bg-gray-900/50">
            <ErrorBoundary name="Filter Panel">
              <FilterPanel />
            </ErrorBoundary>
          </aside>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Status Bar */}
          <div className="px-4 py-2 border-b border-gray-800/50 flex items-center justify-between bg-gray-900/30">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                Showing <span className="text-white font-medium">{filteredCount.toLocaleString()}</span> of {totalCount.toLocaleString()} stocks
              </span>
              {activeFilters.length > 0 && (
                <span className="px-2 py-0.5 bg-indigo-600/20 text-indigo-400 rounded text-xs">
                  {activeFilters.length} filters
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500 font-mono">
              Filter: {filterExecutionTime.toFixed(1)}ms
            </span>
          </div>

          {/* Grid + Chart Layout */}
          <div className="flex-1 flex overflow-hidden">
            {/* DataGrid */}
            <div className={clsx(
              'overflow-hidden transition-all duration-300',
              chartOpen && selectedSymbol ? 'w-3/5' : 'w-full'
            )}>
              <ErrorBoundary name="Data Grid">
                <DataGrid stocks={stocks} onRowClick={(stock) => setSelectedSymbol(stock.symbol)} />
              </ErrorBoundary>
            </div>

            {/* Chart Panel */}
            {chartOpen && selectedSymbol && (
              <div className="w-2/5 border-l border-gray-800/50 overflow-hidden bg-gray-900/30">
                <ErrorBoundary name="Stock Chart">
                  <div className="h-full overflow-y-auto">
                    <StockChart symbol={selectedSymbol} />
                  </div>
                </ErrorBoundary>
              </div>
            )}

            {/* Empty state when chart is open but no stock selected */}
            {chartOpen && !selectedSymbol && (
              <div className="w-2/5 border-l border-gray-800/50 flex items-center justify-center bg-gray-900/30">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">📊</div>
                  <div className="text-sm">Select a stock to view chart</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
