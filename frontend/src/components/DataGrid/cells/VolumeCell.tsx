import { memo } from 'react';

function formatVolume(num: number): string {
  if (num >= 10000000) return `${(num / 10000000).toFixed(2)}Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(2)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
  return num.toString();
}

export const VolumeCell = memo(function VolumeCell({
  value,
}: {
  value: number;
}) {
  return (
    <span className="font-mono tabular-nums text-gray-300">
      {formatVolume(value)}
    </span>
  );
});
