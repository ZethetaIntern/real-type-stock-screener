import { NextResponse } from 'next/server';
import { generateMockStocks } from '@/lib/stockData';

const stockCache = new Map<string, { data: ReturnType<typeof generateMockStocks>; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export async function GET(request: Request) {
  const start = performance.now();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '5000');

  const cached = stockCache.get('universe');
  let stocks;
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    stocks = cached.data;
  } else {
    stocks = generateMockStocks(5000);
    stockCache.set('universe', { data: stocks, timestamp: Date.now() });
  }

  const paginated = stocks.slice((page - 1) * pageSize, page * pageSize);

  return NextResponse.json({
    success: true,
    data: paginated,
    meta: {
      total: stocks.length,
      page,
      pageSize,
      timestamp: new Date().toISOString(),
      executionTimeMs: Math.round(performance.now() - start),
    },
  });
}
