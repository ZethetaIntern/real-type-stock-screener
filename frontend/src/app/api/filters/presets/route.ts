import { NextResponse } from 'next/server';

const PRESETS = [
  {
    id: 'value-stocks',
    name: 'Value Stocks',
    filters: [
      { id: 'pe', field: 'pe', operator: 'lt', value: 15, enabled: true },
      { id: 'roe', field: 'roe', operator: 'gt', value: 15, enabled: true },
      { id: 'de', field: 'debtToEquity', operator: 'lt', value: 0.5, enabled: true },
      { id: 'div', field: 'dividendYield', operator: 'gt', value: 2, enabled: true },
    ],
  },
  {
    id: 'growth-momentum',
    name: 'Growth Momentum',
    filters: [
      { id: 'rev-growth', field: 'revenueGrowthYoY', operator: 'gt', value: 20, enabled: true },
      { id: 'profit-growth', field: 'profitGrowthYoY', operator: 'gt', value: 20, enabled: true },
      { id: 'rsi-low', field: 'rsi14', operator: 'gte', value: 40, enabled: true },
      { id: 'rsi-high', field: 'rsi14', operator: 'lte', value: 70, enabled: true },
    ],
  },
  {
    id: 'large-cap-quality',
    name: 'Large Cap Quality',
    filters: [
      { id: 'mcap', field: 'marketCap', operator: 'gte', value: 2000000000000, enabled: true },
      { id: 'roce', field: 'roce', operator: 'gt', value: 15, enabled: true },
      { id: 'promo', field: 'promoterHolding', operator: 'gt', value: 50, enabled: true },
    ],
  },
  {
    id: 'technical-breakout',
    name: 'Technical Breakout',
    filters: [
      { id: 'rsi-range-low', field: 'rsi14', operator: 'gte', value: 50, enabled: true },
      { id: 'rsi-range-high', field: 'rsi14', operator: 'lte', value: 70, enabled: true },
      { id: 'vol-above', field: 'volumeVsAvg', operator: 'in', value: ['2x', '3x'], enabled: true },
      { id: 'bb', field: 'bollingerPosition', operator: 'eq', value: 'Within', enabled: true },
    ],
  },
];

export async function GET() {
  const start = performance.now();

  return NextResponse.json({
    success: true,
    data: PRESETS,
    meta: {
      total: PRESETS.length,
      page: 1,
      pageSize: PRESETS.length,
      timestamp: new Date().toISOString(),
      executionTimeMs: Math.round(performance.now() - start),
    },
  });
}

export async function POST(request: Request) {
  const start = performance.now();

  try {
    const body = await request.json();
    const { name, filters } = body;

    if (!name || !filters) {
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
          error: { code: 'INVALID_INPUT', message: 'Name and filters are required' },
        },
        { status: 400 }
      );
    }

    const newPreset = {
      id: `custom-${Date.now()}`,
      name,
      filters,
    };

    return NextResponse.json({
      success: true,
      data: newPreset,
      meta: {
        total: 1,
        page: 1,
        pageSize: 1,
        timestamp: new Date().toISOString(),
        executionTimeMs: Math.round(performance.now() - start),
      },
    });
  } catch {
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
        error: { code: 'PARSE_ERROR', message: 'Invalid JSON body' },
      },
      { status: 400 }
    );
  }
}
