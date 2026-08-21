'use client';
import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface MultiSelectFilterProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function MultiSelectFilter({ label, options, selected, onChange }: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = options.filter((o) => o.toLowerCase().includes(search.toLowerCase()));

  const toggle = (option: string) => {
    onChange(selected.includes(option) ? selected.filter((s) => s !== option) : [...selected, option]);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-700 dark:text-gray-300"
      >
        {selected.length > 0 ? `${selected.length} selected` : label}
        <ChevronDown size={14} />
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg max-h-48 overflow-auto">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 rounded px-2 py-1">
              <Search size={14} className="text-gray-400 dark:text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-sm text-gray-900 dark:text-white w-full outline-none"
                placeholder="Search..."
              />
            </div>
          </div>
          {filtered.map((option) => (
            <label key={option} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggle(option)}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
