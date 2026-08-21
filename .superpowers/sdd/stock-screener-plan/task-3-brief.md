# Task 3: Wire Up React Query

**Files:**
- Create: `frontend/src/app/providers.tsx`
- Modify: `frontend/src/app/layout.tsx`
- Create: `frontend/src/lib/api.ts`

**Interfaces:**
- Produces: `QueryClientProvider` wrapping the app, `fetchStocks()`, `fetchStockHistory()`, `fetchFilterPresets()`, `fetchSectors()` helpers
- Consumes: API routes from Task 2

## Step 1: Create API fetch helpers

```typescript
// frontend/src/lib/api.ts
import { Stock, OHLCV, FilterConfig } from '@/types/stock';

interface ApiResponse<T> {
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
```

## Step 2: Create providers component

```typescript
// frontend/src/app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

## Step 3: Update layout.tsx

```typescript
// frontend/src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EquityPulse - Real-Time Indian Equity Screener',
  description: 'Production-grade stock screener for Indian equities',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## Step 4: Verify build

```bash
npm run build
```

Expected: Build succeeds.

## Step 5: Commit

```bash
git add src/lib/api.ts src/app/layout.tsx src/app/providers.tsx
git commit -m "feat(query): add React Query provider and API fetch helpers"
```
