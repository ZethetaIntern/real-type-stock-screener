'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter, BarChart3, Star, Sun, Moon, X } from 'lucide-react';
import { useStockStore } from '@/stores/stockStore';
import { Stock } from '@/types/stock';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  stocks: Stock[];
}

interface Command {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'stock' | 'filter' | 'preset' | 'toggle';
}

export function CommandPalette({ isOpen, onClose, stocks }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setSelectedSymbol, setFilterPanelOpen, setChartOpen, loadPreset, toggleTheme, theme } =
    useStockStore();

  const presets = [
    { id: 'value', name: 'Value Stocks', filters: [] },
    { id: 'growth', name: 'Growth Momentum', filters: [] },
    { id: 'largecap', name: 'Large Cap Quality', filters: [] },
    { id: 'technical', name: 'Technical Breakout', filters: [] },
  ];

  const commands: Command[] = [
    // Stock search results
    ...stocks
      .filter(
        (s) =>
          s.symbol.toLowerCase().includes(query.toLowerCase()) ||
          s.companyName.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5)
      .map((stock) => ({
        id: `stock-${stock.symbol}`,
        label: stock.symbol,
        description: stock.companyName,
        icon: <BarChart3 size={16} />,
        action: () => {
          setSelectedSymbol(stock.symbol);
          setChartOpen(true);
          onClose();
        },
        category: 'stock' as const,
      })),

    // Filter toggles
    {
      id: 'toggle-filters',
      label: 'Toggle Filter Panel',
      description: 'Show or hide the filter sidebar',
      icon: <Filter size={16} />,
      action: () => {
        setFilterPanelOpen(useStockStore.getState().filterPanelOpen);
        onClose();
      },
      category: 'toggle',
    },
    {
      id: 'toggle-chart',
      label: 'Toggle Chart Panel',
      description: 'Show or hide the chart panel',
      icon: <BarChart3 size={16} />,
      action: () => {
        setChartOpen(!useStockStore.getState().chartOpen);
        onClose();
      },
      category: 'toggle',
    },
    {
      id: 'toggle-theme',
      label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      description: 'Toggle between dark and light themes',
      icon: theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />,
      action: () => {
        toggleTheme();
        onClose();
      },
      category: 'toggle',
    },

    // Presets
    ...presets.map((preset) => ({
      id: `preset-${preset.id}`,
      label: `Load ${preset.name}`,
      description: 'Apply preset filter configuration',
      icon: <Star size={16} />,
      action: () => {
        loadPreset(preset.filters);
        onClose();
      },
      category: 'preset' as const,
    })),
  ];

  const filteredCommands = commands.filter((cmd) => {
    if (!query) return true;
    return (
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(query.toLowerCase())
    );
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    },
    [isOpen, filteredCommands, selectedIndex, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <Search size={20} className="text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stocks, commands, or presets..."
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none"
          />
          <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Commands List */}
        <div className="max-h-[300px] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">No results found</div>
          ) : (
            filteredCommands.map((cmd, index) => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  index === selectedIndex
                    ? 'bg-indigo-50 dark:bg-indigo-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="text-gray-400">{cmd.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {cmd.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {cmd.description}
                  </div>
                </div>
                <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded capitalize">
                  {cmd.category}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-xs text-gray-400">{filteredCommands.length} results</span>
        </div>
      </div>
    </div>
  );
}
