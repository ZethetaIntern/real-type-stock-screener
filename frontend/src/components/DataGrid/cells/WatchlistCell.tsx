import { memo } from 'react';
import { Star } from 'lucide-react';
import clsx from 'clsx';

interface WatchlistCellProps {
  symbol: string;
  isWatchlisted: boolean;
  onToggle: () => void;
}

export const WatchlistCell = memo(function WatchlistCell({
  isWatchlisted,
  onToggle,
}: WatchlistCellProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="p-1 hover:bg-gray-700 rounded transition-colors"
    >
      <Star
        size={16}
        className={clsx(
          isWatchlisted ? 'fill-yellow-500 text-yellow-500' : 'text-gray-500'
        )}
      />
    </button>
  );
});
