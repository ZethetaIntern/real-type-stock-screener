import { memo } from 'react';
import clsx from 'clsx';

export const RSICell = memo(function RSICell({ value }: { value: number }) {
  let classes = 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
  if (value < 30) classes = 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100';
  else if (value > 70) classes = 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100';
  else classes = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100';

  return (
    <span className={clsx('px-2 py-1 rounded text-xs font-mono', classes)}>{value.toFixed(1)}</span>
  );
});
