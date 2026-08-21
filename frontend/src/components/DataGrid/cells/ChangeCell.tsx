import { memo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

export const ChangeCell = memo(function ChangeCell({
  value,
}: {
  value: number;
}) {
  const isPositive = value >= 0;
  return (
    <div
      className={clsx(
        'flex items-center justify-end gap-1 font-mono tabular-nums',
        isPositive ? 'text-positive' : 'text-negative'
      )}
    >
      {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      <span>
        {isPositive ? '+' : ''}
        {value.toFixed(2)}%
      </span>
    </div>
  );
});
