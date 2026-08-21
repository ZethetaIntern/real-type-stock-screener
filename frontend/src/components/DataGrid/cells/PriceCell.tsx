import { memo } from 'react';

function formatINR(num: number): string {
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const PriceCell = memo(function PriceCell({
  value,
}: {
  value: number;
}) {
  return <span className="font-mono tabular-nums">₹{formatINR(value)}</span>;
});
