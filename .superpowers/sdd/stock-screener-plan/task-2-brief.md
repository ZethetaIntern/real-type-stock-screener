# Task 2: Create API Routes

**Files:**
- Create: `frontend/src/app/api/stocks/route.ts`
- Create: `frontend/src/app/api/stocks/[symbol]/route.ts`
- Create: `frontend/src/app/api/stocks/[symbol]/history/route.ts`
- Create: `frontend/src/app/api/filters/presets/route.ts`
- Create: `frontend/src/app/api/sectors/route.ts`

**Interfaces:**
- Produces: REST endpoints returning `ApiResponse<T>` envelope
- Consumes: `generateMockStocks()`, `generateOHLCV()` from `lib/stockData.ts`

## Step 1: Create stocks list API route

`GET /api/stocks?page=N&pageSize=N` — returns paginated stock universe with 5min server-side cache.

```typescript
// frontend/src/app/api/stocks/route.ts
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
```

## Step 2: Create single stock API route

`GET /api/stocks/[symbol]` — returns one stock or 404.

```typescript
// frontend/src/app/api/stocks/[symbol]/route.ts
import { NextResponse } from 'next/server';
import { generateMockStocks } from '@/lib/stockData';

export async function GET(request: Request, { params }: { params: { symbol: string } }) {
  const start = performance.now();
  const { symbol } = params;

  const stocks = generateMockStocks(5000);
  const stock = stocks.find((s) => s.symbol === symbol);

  if (!stock) {
    return NextResponse.json(
      { success: false, data: null, meta: { total: 0, page: 1, pageSize: 1, timestamp: new Date().toISOString(), executionTimeMs: Math.round(performance.now() - start) }, error: { code: 'NOT_FOUND', message: `Stock ${symbol} not found` } },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: stock,
    meta: { total: 1, page: 1, pageSize: 1, timestamp: new Date().toISOString(), executionTimeMs: Math.round(performance.now() - start) },
  });
}
```

## Step 3: Create OHLCV history API route

`GET /api/stocks/[symbol]/history?days=252` — returns candle array.

```typescript
// frontend/src/app/api/stocks/[symbol]/history/route.ts
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
```

## Step 4: Create filter presets API route

`GET /api/filters/presets` — returns preset filter configurations.

```typescript
// frontend/src/app/api/filters/presets/route.ts
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
  return NextResponse.json({
    success: true,
    data: PRESETS,
    meta: { total: PRESETS.length, page: 1, pageSize: PRESETS.length, timestamp: new Date().toISOString(), executionTimeMs: 0 },
  });
}
```

## Step 5: Create sectors API route

`GET /api/sectors` — returns sector→industry tree.

```typescript
// frontend/src/app/api/sectors/route.ts
import { NextResponse } from 'next/server';
import { SECTORS } from '@/types/stock';

const SECTOR_INDUSTRY_MAP: Record<string, string[]> = {
  IT: ['Software Services', 'IT Consulting', 'BPO', 'Hardware', 'Semiconductors'],
  Banking: ['Private Bank', 'Public Bank', 'NBFC', 'Insurance', 'Asset Management'],
  Pharma: ['Generic Drugs', 'API', 'Formulations', 'Biotech', 'Herbal'],
  FMCG: ['Personal Care', 'Food Products', 'Household Care', 'Beverages', 'Tobacco'],
  Auto: ['Automobiles', 'Auto Components', 'Two Wheelers', 'Commercial Vehicles', 'Tractors'],
  Metal: ['Steel', 'Aluminium', 'Copper', 'Mining', 'Ferro Alloys'],
  Energy: ['Oil & Gas', 'Power Generation', 'Power Distribution', 'Renewable Energy', 'Coal'],
  Realty: ['Real Estate', 'Construction', 'Infrastructure', 'Cement', 'Building Materials'],
  Telecom: ['Telecom Services', 'Tower Infrastructure', 'Network Equipment', 'Content Providers', 'Cable TV'],
  Infrastructure: ['EPC', 'Roads', 'Highways', 'Bridges', 'Urban Infrastructure'],
  Media: ['Media & Entertainment', 'Broadcasting', 'Publishing', 'Digital Media', 'Film Production'],
  Others: ['Diversified', 'Trading', 'Financial Services', 'Logistics', 'Textiles'],
};

export async function GET() {
  const data = SECTORS.map((sector) => ({
    sector,
    industries: SECTOR_INDUSTRY_MAP[sector] || [],
  }));

  return NextResponse.json({
    success: true,
    data,
    meta: { total: data.length, page: 1, pageSize: data.length, timestamp: new Date().toISOString(), executionTimeMs: 0 },
  });
}
```

## Step 6: Commit

```bash
git add src/app/api/
git commit -m "feat(api): add mock REST endpoints for stocks, history, presets, sectors"
```
