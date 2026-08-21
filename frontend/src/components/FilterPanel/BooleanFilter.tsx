'use client';
import clsx from 'clsx';

interface BooleanFilterProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function BooleanFilter({ label, value, onChange }: BooleanFilterProps) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <div
        onClick={() => onChange(!value)}
        className={clsx(
          'w-10 h-6 rounded-full transition-colors relative',
          value ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-700'
        )}
      >
        <div
          className={clsx(
            'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
            value ? 'translate-x-5' : 'translate-x-1'
          )}
        />
      </div>
    </label>
  );
}
