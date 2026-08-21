'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchStocks, fetchStockDetail, fetchStockHistory } from '@/lib/api';
import { useStockStore } from '@/stores/stockStore';

export function useStockData() {
  const setStocks = useStockStore((s) => s.setStocks);

  const query = useQuery({
    queryKey: ['stocks', 'universe'],
    queryFn: () => fetchStocks(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.data?.data) {
      setStocks(query.data.data);
    }
  }, [query.data, setStocks]);

  return {
    stocks: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useStockDetail(symbol: string | null) {
  return useQuery({
    queryKey: ['stock', symbol],
    queryFn: () => fetchStockDetail(symbol!),
    enabled: !!symbol,
    staleTime: 30 * 1000,
  });
}

export function useStockHistory(symbol: string | null, days: number = 252) {
  return useQuery({
    queryKey: ['stock', symbol, 'history', days],
    queryFn: () => fetchStockHistory(symbol!, days),
    enabled: !!symbol,
    staleTime: 60 * 1000,
  });
}
