import { NextResponse } from 'next/server';

const INDICES = [
  {
    id: 'nifty50',
    name: 'NIFTY 50',
    description: 'Benchmark index of NSE comprising 50 large-cap stocks',
    stockCount: 50,
  },
  {
    id: 'niftynext50',
    name: 'NIFTY Next 50',
    description: 'Index of 50 stocks from NIFTY 100 excluding NIFTY 50',
    stockCount: 50,
  },
  {
    id: 'niftymidcap100',
    name: 'NIFTY Midcap 100',
    description: 'Index of 100 mid-cap stocks',
    stockCount: 100,
  },
  {
    id: 'niftysmallcap250',
    name: 'NIFTY Smallcap 250',
    description: 'Index of 250 small-cap stocks',
    stockCount: 250,
  },
  {
    id: 'bsesensex',
    name: 'BSE Sensex',
    description: 'Benchmark index of BSE comprising 30 large-cap stocks',
    stockCount: 30,
  },
];

export async function GET() {
  const start = performance.now();

  return NextResponse.json({
    success: true,
    data: INDICES,
    meta: {
      total: INDICES.length,
      page: 1,
      pageSize: INDICES.length,
      timestamp: new Date().toISOString(),
      executionTimeMs: Math.round(performance.now() - start),
    },
  });
}
