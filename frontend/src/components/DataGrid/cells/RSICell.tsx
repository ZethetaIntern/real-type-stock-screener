import { memo } from 'react';
import clsx from 'clsx';

export const RSICell = memo(function RSICell({ value }: { value: number }) {
  let bgColor = 'bg-gray-700';
  if (value < 30) bgColor = 'bg-green-900';
  else if (value > 70) bgColor = 'bg-red-900';
  else bgColor = 'bg-yellow-900';

  return (
    <span className={clsx('px-2 py-1 rounded text-xs font-mono', bgColor)}>
      {value.toFixed(1)}
    </span>
  );
});
