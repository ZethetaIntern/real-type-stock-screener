'use client';
import { ConnectionStatus as ConnectionStatusType } from '@/types/stock';
import clsx from 'clsx';

interface ConnectionStatusProps {
  status: ConnectionStatusType;
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={clsx(
          'w-2 h-2 rounded-full',
          status === 'connected' && 'bg-positive',
          status === 'reconnecting' && 'bg-warning animate-pulse',
          status === 'disconnected' && 'bg-negative'
        )}
      />
      <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">{status}</span>
    </div>
  );
}
