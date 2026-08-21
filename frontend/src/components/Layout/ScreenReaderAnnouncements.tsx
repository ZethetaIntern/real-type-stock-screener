'use client';

import { useEffect, useRef } from 'react';
import { useStockStore } from '@/stores/stockStore';

export function ScreenReaderAnnouncements() {
  const announcementRef = useRef<HTMLDivElement>(null);
  const { livePrices, selectedSymbol } = useStockStore();

  useEffect(() => {
    if (!selectedSymbol || !announcementRef.current) return;

    const price = livePrices.get(selectedSymbol);
    if (!price) return;

    const isPositive = price.change >= 0;
    const announcement = `${selectedSymbol}: Price updated to ${price.price.toFixed(2)}, ${isPositive ? 'up' : 'down'} ${Math.abs(price.changePercent).toFixed(2)} percent`;

    announcementRef.current.textContent = announcement;
  }, [livePrices, selectedSymbol]);

  return (
    <div
      ref={announcementRef}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );
}
