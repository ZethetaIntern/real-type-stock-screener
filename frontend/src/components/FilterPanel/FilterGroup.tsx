'use client';
import { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface FilterGroupProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function FilterGroup({ title, children, defaultOpen = false }: FilterGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {title}
        <ChevronDown size={16} className={clsx('transition-transform', isOpen && 'rotate-180')} />
      </button>
      {isOpen && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}
