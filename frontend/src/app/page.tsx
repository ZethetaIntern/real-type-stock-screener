'use client';

import { useEffect, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchStocks } from '@/lib/api';
import { useStockStore } from '@/stores/stockStore';
import { useStockScreener } from '@/hooks/useStockScreener';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useKeyboardNav } from '@/hooks/useKeyboardNav';
import { Header } from '@/components/Layout/Header';
import { FilterPanel } from '@/components/FilterPanel/FilterPanel';
import DataGrid from '@/components/DataGrid/DataGrid';
import StockChart from '@/components/Chart/StockChart';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { OfflineBanner } from '@/components/Layout/OfflineBanner';
import { ScreenReaderAnnouncements } from '@/components/Layout/ScreenReaderAnnouncements';
import { KeyboardCheatSheet } from '@/components/Layout/KeyboardCheatSheet';
import { CommandPalette } from '@/components/Layout/CommandPalette';
import clsx from 'clsx';

export default function ScreenerPage() {
  const {
    filterPanelOpen,
    chartOpen,
    selectedSymbol,
    setStocks,
    setSelectedSymbol,
    activeFilters,
  } = useStockStore();
  const { stocks, filteredCount, totalCount, filterExecutionTime } = useStockScreener();
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

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

  const { showCheatSheet: keyboardCheatSheet } = useKeyboardNav({
    stocks,
    onStockSelect: (symbol) => setSelectedSymbol(symbol),
  });

  useEffect(() => {
    setShowCheatSheet(keyboardCheatSheet);
  }, [keyboardCheatSheet]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setShowCommandPalette((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-gray-500 dark:text-gray-400">Loading stock universe...</div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      <OfflineBanner />
      <Header onToggleMobileFilter={() => setIsMobileFilterOpen(!isMobileFilterOpen)} />
      <ScreenReaderAnnouncements />
      <KeyboardCheatSheet isOpen={showCheatSheet} onClose={() => setShowCheatSheet(false)} />
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        stocks={stocks}
      />

      <div className="flex h-[calc(100vh-57px)]">
        {filterPanelOpen && (
          <aside className="hidden md:block w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-800/50 bg-gray-50 dark:bg-gray-900/50">
            <ErrorBoundary name="Filter Panel">
              <FilterPanel />
            </ErrorBoundary>
          </aside>
        )}

        {isMobileFilterOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <aside className="absolute left-0 top-0 h-full w-80 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800">
              <ErrorBoundary name="Filter Panel">
                <FilterPanel />
              </ErrorBoundary>
            </aside>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800/50 flex items-center justify-between bg-gray-100 dark:bg-gray-900/30">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Showing{' '}
                <span className="text-gray-900 dark:text-white font-medium">
                  {filteredCount.toLocaleString()}
                </span>{' '}
                of {totalCount.toLocaleString()} stocks
              </span>
              {activeFilters.length > 0 && (
                <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 rounded text-xs">
                  {activeFilters.length} filters
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCommandPalette(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-gray-500 dark:text-gray-400">Search...</span>
                <kbd className="px-1.5 py-0.5 font-mono bg-gray-300 dark:bg-gray-700 rounded text-[10px]">
                  Ctrl+K
                </kbd>
              </button>
              <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                Filter: {filterExecutionTime.toFixed(1)}ms
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            <div
              className={clsx(
                'overflow-hidden transition-all duration-300',
                chartOpen && selectedSymbol ? 'md:w-3/5 w-full h-1/2 md:h-full' : 'w-full'
              )}
            >
              <ErrorBoundary name="Data Grid">
                <DataGrid stocks={stocks} onRowClick={(stock) => setSelectedSymbol(stock.symbol)} />
              </ErrorBoundary>
            </div>

            {chartOpen && selectedSymbol && (
              <div
                className={clsx(
                  'border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800/50 overflow-hidden bg-gray-50 dark:bg-gray-900/30',
                  'md:w-2/5 w-full h-1/2 md:h-full'
                )}
              >
                <ErrorBoundary name="Stock Chart">
                  <div className="h-full overflow-y-auto">
                    <StockChart symbol={selectedSymbol} />
                  </div>
                </ErrorBoundary>
              </div>
            )}

            {chartOpen && !selectedSymbol && (
              <div className="md:w-2/5 w-full border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800/50 flex items-center justify-center bg-gray-50 dark:bg-gray-900/30">
                <div className="text-center text-gray-400 dark:text-gray-500">
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
