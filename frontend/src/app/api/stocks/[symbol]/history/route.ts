import { NextResponse } from 'next/server';
import { generateMockStocks, generateOHLCV } from '@/lib/stockData';

export async function GET(request: Request, { params }: { params: { symbol: string } }) {
  const start = performance.now();
  const { symbol } = params;
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '252');

  const stocks = generateMockStocks(5000);
  const stock = stocks.find((s) => s.symbol === symbol);

  if (!stock) {
    return NextResponse.json(
      { success: false, data: null, meta: { total: 0, page: 1, pageSize: 1, timestamp: new Date().toISOString(), executionTimeMs: Math.round(performance.now() - start) }, error: { code: 'NOT_FOUND', message: `Stock ${symbol} not found` } },
      { status: 404 }
    );
  }

  const candles = generateOHLCV(stock.lastPrice, days, 0.02, stock.avgVolume20D);

  return NextResponse.json({
    success: true,
    data: candles,
    meta: { total: candles.length, page: 1, pageSize: candles.length, timestamp: new Date().toISOString(), executionTimeMs: Math.round(performance.now() - start) },
  });
}
