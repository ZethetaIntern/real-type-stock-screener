'use client';
import { useState, useCallback, useRef } from 'react';

interface RangeFilterProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value?: [number, number];
  onChange: (range: [number, number]) => void;
  unit?: string;
}

export function RangeFilter({ label, min, max, step = 1, value, onChange, unit }: RangeFilterProps) {
  const [localMin, setLocalMin] = useState(value?.[0] ?? min);
  const [localMax, setLocalMax] = useState(value?.[1] ?? max);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedChange = useCallback((newMin: number, newMax: number) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => onChange([newMin, newMax]), 300);
  }, [onChange]);

  return (
    <div className="space-y-2">
      <label className="text-xs text-gray-500 dark:text-gray-400">{label}</label>
      <div className="flex gap-2">
        <input
          type="number"
          value={localMin}
          step={step}
          onChange={(e) => { setLocalMin(Number(e.target.value)); debouncedChange(Number(e.target.value), localMax); }}
          className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm text-gray-900 dark:text-white"
          placeholder="Min"
        />
        <span className="text-gray-400 dark:text-gray-500 self-center">-</span>
        <input
          type="number"
          value={localMax}
          step={step}
          onChange={(e) => { setLocalMax(Number(e.target.value)); debouncedChange(localMin, Number(e.target.value)); }}
          className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm text-gray-900 dark:text-white"
          placeholder="Max"
        />
      </div>
      {unit && <span className="text-xs text-gray-400 dark:text-gray-500">{unit}</span>}
    </div>
  );
}
