import { memo } from 'react';

function formatMarketCap(num: number): string {
  if (num >= 100000000000) return `₹${(num / 100000000000).toFixed(2)}LCr`;
  if (num >= 1000000000) return `₹${(num / 1000000000).toFixed(2)}Cr`;
  if (num >= 1000000) return `₹${(num / 1000000).toFixed(2)}L`;
  return `₹${num.toFixed(2)}`;
}

export const MarketCapCell = memo(function MarketCapCell({
  value,
}: {
  value: number;
}) {
  return (
    <span className="font-mono tabular-nums text-gray-300">
      {formatMarketCap(value)}
    </span>
  );
});
