import { memo, useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';
import { useStockStore } from '@/stores/stockStore';

export const ChangeCell = memo(function ChangeCell({
  value,
  symbol,
}: {
  value: number;
  symbol: string;
}) {
  const livePrice = useStockStore((s) => s.livePrices.get(symbol));
  const change = livePrice?.changePercent ?? value;
  const isPositive = change >= 0;
  const [flashClass, setFlashClass] = useState('');
  const prevChange = useRef(change);

  useEffect(() => {
    if (change > prevChange.current) {
      setFlashClass('animate-flash-green');
    } else if (change < prevChange.current) {
      setFlashClass('animate-flash-red');
    }
    prevChange.current = change;
    const timer = setTimeout(() => setFlashClass(''), 300);
    return () => clearTimeout(timer);
  }, [change]);

  return (
    <div
      className={clsx(
        'flex items-center justify-end gap-1 font-mono tabular-nums',
        isPositive ? 'text-positive' : 'text-negative',
        flashClass
      )}
    >
      {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      <span>
        {isPositive ? '+' : ''}
        {change.toFixed(2)}%
      </span>
    </div>
  );
});
