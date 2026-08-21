'use client';

import { X } from 'lucide-react';

interface KeyboardCheatSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { key: '↑ ↓', action: 'Navigate rows' },
  { key: '← →', action: 'Navigate columns' },
  { key: 'Enter', action: 'Open chart' },
  { key: 'Space', action: 'Toggle watchlist' },
  { key: 'Home', action: 'First row' },
  { key: 'End', action: 'Last row' },
  { key: 'Page Up', action: 'Previous page' },
  { key: 'Page Down', action: 'Next page' },
  { key: 'F', action: 'Toggle filters' },
  { key: 'C', action: 'Toggle chart' },
  { key: '/', action: 'Focus search' },
  { key: 'Tab', action: 'Cycle panels' },
  { key: 'Esc', action: 'Close modal' },
  { key: '?', action: 'Toggle this help' },
];

export function KeyboardCheatSheet({ isOpen, onClose }: KeyboardCheatSheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 w-96 max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            {shortcuts.map((shortcut) => (
              <div key={shortcut.key} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">{shortcut.action}</span>
                <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
