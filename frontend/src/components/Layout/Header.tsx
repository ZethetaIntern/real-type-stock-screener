'use client';
import { Activity, Filter, BarChart3 } from 'lucide-react';
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
