import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Stock } from '@/types/stock';

interface StockDB extends DBSchema {
  stocks: {
    key: string;
    value: Stock;
    indexes: { 'by-sector': string; 'by-marketCap': number };
  };
  metadata: {
    key: string;
    value: { key: string; timestamp: number; count: number };
  };
}

let dbPromise: Promise<IDBPDatabase<StockDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<StockDB>('equitypulse-db', 1, {
      upgrade(db) {
        const stockStore = db.createObjectStore('stocks', { keyPath: 'symbol' });
        stockStore.createIndex('by-sector', 'sector');
        stockStore.createIndex('by-marketCap', 'marketCap');

        db.createObjectStore('metadata', { keyPath: 'key' });
      },
    });
  }
  return dbPromise;
}

export async function cacheStocks(stocks: Stock[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['stocks', 'metadata'], 'readwrite');

  await Promise.all([
    ...stocks.map((stock) => tx.objectStore('stocks').put(stock)),
    tx.objectStore('metadata').put({
      key: 'stocks-cache',
      timestamp: Date.now(),
      count: stocks.length,
    }),
    tx.done,
  ]);
}

export async function getCachedStocks(): Promise<Stock[] | null> {
  try {
    const db = await getDB();
    const metadata = await db.get('metadata', 'stocks-cache');

    if (!metadata) return null;

    const cacheAge = Date.now() - metadata.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (cacheAge > maxAge) return null;

    const stocks = await db.getAll('stocks');
    return stocks.length > 0 ? stocks : null;
  } catch {
    return null;
  }
}

export async function clearCache(): Promise<void> {
  const db = await getDB();
  await db.clear('stocks');
  await db.clear('metadata');
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}
