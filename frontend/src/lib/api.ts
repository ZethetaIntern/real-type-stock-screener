import { Stock, OHLCV, FilterConfig } from '@/types/stock';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    total: number;
    page: number;
    pageSize: number;
    timestamp: string;
    executionTimeMs: number;
  };
  error?: { code: string; message: string };
}

async function fetchApi<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchStocks(page = 1, pageSize = 5000) {
  return fetchApi<Stock[]>(`/api/stocks?page=${page}&pageSize=${pageSize}`);
}

export async function fetchStockDetail(symbol: string) {
  return fetchApi<Stock>(`/api/stocks/${symbol}`);
}

export async function fetchStockHistory(symbol: string, days = 252) {
  return fetchApi<OHLCV[]>(`/api/stocks/${symbol}/history?days=${days}`);
}

export async function fetchFilterPresets() {
  return fetchApi<{ id: string; name: string; filters: FilterConfig[] }[]>('/api/filters/presets');
}

export async function fetchSectors() {
  return fetchApi<{ sector: string; industries: string[] }[]>('/api/sectors');
}
