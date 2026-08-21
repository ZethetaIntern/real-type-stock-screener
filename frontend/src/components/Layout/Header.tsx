'use client';
import { Activity, Filter, BarChart3, Sun, Moon, Menu } from 'lucide-react';
import { useStockStore } from '@/stores/stockStore';
import { ConnectionStatus } from './ConnectionStatus';

interface HeaderProps {
  onToggleMobileFilter?: () => void;
}

export function Header({ onToggleMobileFilter }: HeaderProps) {
  const {
    filterPanelOpen,
    setFilterPanelOpen,
    chartOpen,
    setChartOpen,
    connectionStatus,
    theme,
    toggleTheme,
  } = useStockStore();

  return (
    <header className="header-gradient px-4 md:px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onToggleMobileFilter}
            className="md:hidden p-2 rounded-lg hover:bg-gray-800/50 dark:text-gray-400 text-gray-600"
            aria-label="Toggle filters"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Activity className="text-white" size={18} />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent dark:from-white dark:to-gray-300 from-gray-900 to-gray-600">
              EquityPulse
            </h1>
          </div>
          <ConnectionStatus status={connectionStatus} />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-800/50 dark:text-gray-400 text-gray-600 border border-transparent transition-all duration-200"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setFilterPanelOpen(!filterPanelOpen)}
            className={`hidden md:block p-2 rounded-lg transition-all duration-200 ${
              filterPanelOpen
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'hover:bg-gray-800/50 dark:text-gray-400 text-gray-600 border border-transparent'
            }`}
            title="Toggle Filters"
          >
            <Filter size={18} />
          </button>
          <button
            onClick={() => setChartOpen(!chartOpen)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              chartOpen
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'hover:bg-gray-800/50 dark:text-gray-400 text-gray-600 border border-transparent'
            }`}
            title="Toggle Chart"
          >
            <BarChart3 size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
