import { NextResponse } from 'next/server';
import { generateMockStocks } from '@/lib/stockData';

export async function GET(request: Request, { params }: { params: { symbol: string } }) {
  const start = performance.now();
  const { symbol } = params;

  const stocks = generateMockStocks(5000);
  const stock = stocks.find((s) => s.symbol === symbol);

  if (!stock) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        meta: {
          total: 0,
          page: 1,
          pageSize: 1,
          timestamp: new Date().toISOString(),
          executionTimeMs: Math.round(performance.now() - start),
        },
        error: { code: 'NOT_FOUND', message: `Stock ${symbol} not found` },
      },
      { status: 404 }
    );
  }

  const fundamentals = {
    symbol: stock.symbol,
    companyName: stock.companyName,
    sector: stock.sector,
    industry: stock.industry,
    marketCap: stock.marketCap,
    marketCapCategory: stock.marketCapCategory,
    pe: stock.pe,
    pb: stock.pb,
    eps: stock.eps,
    roe: stock.roe,
    roce: stock.roce,
    debtToEquity: stock.debtToEquity,
    currentRatio: stock.currentRatio,
    dividendYield: stock.dividendYield,
    promoterHolding: stock.promoterHolding,
    revenueGrowthYoY: stock.revenueGrowthYoY,
    profitGrowthYoY: stock.profitGrowthYoY,
  };

  return NextResponse.json({
    success: true,
    data: fundamentals,
    meta: {
      total: 1,
      page: 1,
      pageSize: 1,
      timestamp: new Date().toISOString(),
      executionTimeMs: Math.round(performance.now() - start),
    },
  });
}
