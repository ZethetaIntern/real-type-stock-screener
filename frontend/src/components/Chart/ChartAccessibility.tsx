'use client';

import { useState } from 'react';
import { Table, BarChart3 } from 'lucide-react';
import { OHLCV } from '@/types/stock';

interface ChartAccessibilityProps {
  data: OHLCV[];
  symbol: string;
}

export function ChartAccessibility({ data, symbol }: ChartAccessibilityProps) {
  const [showTable, setShowTable] = useState(false);

  if (!showTable) {
    return (
      <button
        onClick={() => setShowTable(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Show data table"
      >
        <Table size={14} />
        <span>Data Table</span>
      </button>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{symbol} — OHLCV Data</h3>
        <button
          onClick={() => setShowTable(false)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Show chart"
        >
          <BarChart3 size={14} />
          <span>Chart</span>
        </button>
      </div>
      <div className="overflow-auto max-h-[400px]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-100 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                Date
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                Open
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                High
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                Low
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                Close
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                Volume
              </th>
            </tr>
          </thead>
          <tbody>
            {data.slice(-30).map((candle, i) => (
              <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-4 py-2 text-gray-900 dark:text-white font-mono">
                  {new Date(candle.time * 1000).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-right font-mono text-gray-700 dark:text-gray-300">
                  {candle.open.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right font-mono text-gray-700 dark:text-gray-300">
                  {candle.high.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right font-mono text-gray-700 dark:text-gray-300">
                  {candle.low.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right font-mono text-gray-700 dark:text-gray-300">
                  {candle.close.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right font-mono text-gray-700 dark:text-gray-300">
                  {candle.volume.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
