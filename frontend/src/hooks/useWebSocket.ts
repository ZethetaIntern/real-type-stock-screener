'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useStockStore } from '@/stores/stockStore';
import { PriceUpdate, Stock } from '@/types/stock';
import { simulateSectorMovement } from '@/lib/stockData';

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000];

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempt = useRef(0);
  const pendingUpdates = useRef<Map<string, PriceUpdate>>(new Map());
  const rafId = useRef<number | null>(null);
  const stocksRef = useRef<Stock[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { batchUpdatePrices, setConnectionStatus, stocks } = useStockStore();

  stocksRef.current = stocks;

  const flushUpdates = useCallback(() => {
    if (pendingUpdates.current.size > 0) {
      batchUpdatePrices(pendingUpdates.current);
      pendingUpdates.current = new Map();
    }
    rafId.current = null;
  }, [batchUpdatePrices]);

  const connect = useCallback(() => {
    setConnectionStatus('reconnecting');

    try {
      const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');

      ws.onmessage = (event) => {
        try {
          const data: PriceUpdate = JSON.parse(event.data);
          pendingUpdates.current.set(data.symbol, data);

          if (!rafId.current) {
            rafId.current = requestAnimationFrame(flushUpdates);
          }
        } catch {
          console.error('Failed to parse WebSocket message');
        }
      };

      ws.onclose = () => {
        setConnectionStatus('disconnected');
        const delay = RECONNECT_DELAYS[Math.min(reconnectAttempt.current, RECONNECT_DELAYS.length - 1)];
        reconnectAttempt.current++;
        setTimeout(connect, delay);
      };

      ws.onopen = () => {
        setConnectionStatus('connected');
        reconnectAttempt.current = 0;
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    } catch {
      setConnectionStatus('disconnected');
    }
  }, [flushUpdates, setConnectionStatus]);

  const simulatePriceUpdates = useCallback(() => {
    const currentStocks = stocksRef.current;
    if (currentStocks.length === 0) return;

    const updateCount = Math.floor(Math.random() * 41) + 10;
    const shuffled = [...currentStocks].sort(() => Math.random() - 0.5);
    const toUpdate = shuffled.slice(0, updateCount);

    const priceUpdates = simulateSectorMovement(toUpdate);

    for (const stock of toUpdate) {
      const newPrice = priceUpdates.get(stock.symbol);
      if (newPrice === undefined) continue;

      const change = newPrice - stock.previousClose;
      const changePercent = (change / stock.previousClose) * 100;

      pendingUpdates.current.set(stock.symbol, {
        symbol: stock.symbol,
        price: newPrice,
        change,
        changePercent,
        timestamp: Date.now(),
      });
    }

    if (!rafId.current) {
      rafId.current = requestAnimationFrame(flushUpdates);
    }
  }, [flushUpdates]);

  useEffect(() => {
    connect();

    intervalRef.current = setInterval(simulatePriceUpdates, 2000);

    return () => {
      wsRef.current?.close();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [connect, simulatePriceUpdates]);

  return {
    isConnected: useStockStore((state) => state.connectionStatus === 'connected'),
    connectionStatus: useStockStore((state) => state.connectionStatus),
  };
}