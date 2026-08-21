import { memo, useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { useStockStore } from '@/stores/stockStore';

function formatINR(num: number): string {
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const PriceCell = memo(function PriceCell({
  value,
  symbol,
}: {
  value: number;
  symbol: string;
}) {
  const livePrice = useStockStore((s) => s.livePrices.get(symbol));
  const price = livePrice?.price ?? value;
  const [flashClass, setFlashClass] = useState('');
  const prevPrice = useRef(price);

  useEffect(() => {
    if (price > prevPrice.current) {
      setFlashClass('animate-flash-green');
    } else if (price < prevPrice.current) {
      setFlashClass('animate-flash-red');
    }
    prevPrice.current = price;
    const timer = setTimeout(() => setFlashClass(''), 300);
    return () => clearTimeout(timer);
  }, [price]);

  return (
    <span className={clsx('font-mono tabular-nums', flashClass)}>
      ₹{formatINR(price)}
    </span>
  );
});
