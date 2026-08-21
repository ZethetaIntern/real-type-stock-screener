'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchFilterPresets } from '@/lib/api';
import { useStockStore } from '@/stores/stockStore';

export function PresetSelector() {
  const { data: presets } = useQuery({ queryKey: ['presets'], queryFn: () => fetchFilterPresets() });
  const loadPreset = useStockStore((s) => s.loadPreset);

  return (
    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
      <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">Presets</label>
      <select
        onChange={(e) => {
          const preset = presets?.data?.find((p) => p.id === e.target.value);
          if (preset) loadPreset(preset.filters);
        }}
        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white"
      >
        <option value="">Select preset...</option>
        {presets?.data?.map((preset) => (
          <option key={preset.id} value={preset.id}>{preset.name}</option>
        ))}
      </select>
    </div>
  );
}
