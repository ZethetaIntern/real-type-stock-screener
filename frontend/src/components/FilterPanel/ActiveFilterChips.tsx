'use client';
import { X } from 'lucide-react';
import { useStockStore } from '@/stores/stockStore';

export function ActiveFilterChips() {
  const activeFilters = useStockStore((s) => s.activeFilters);
  const removeFilter = useStockStore((s) => s.removeFilter);
  const clearAllFilters = useStockStore((s) => s.clearAllFilters);

  if (activeFilters.length === 0) return null;

  return (
    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">{activeFilters.length} filters active</span>
        <button onClick={clearAllFilters} className="text-xs text-brand-500 hover:text-brand-400">
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {activeFilters.map((filter) => (
          <span key={filter.id} className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-700 dark:text-gray-300">
            {filter.field}: {String(filter.value)}
            <button onClick={() => removeFilter(filter.id)} className="hover:text-red-400">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
