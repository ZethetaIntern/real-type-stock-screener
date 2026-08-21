'use client';
import clsx from 'clsx';

interface SingleSelectFilterProps {
  label: string;
  options: string[];
  selected: string | null;
  onChange: (value: string | null) => void;
}

export function SingleSelectFilter({ label, options, selected, onChange }: SingleSelectFilterProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-gray-500 dark:text-gray-400">{label}</label>
      <div className="flex flex-wrap gap-1">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(selected === option ? null : option)}
            className={clsx(
              'px-2 py-1 rounded text-xs transition-colors',
              selected === option 
                ? 'bg-brand-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
