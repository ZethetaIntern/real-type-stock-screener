# Task 12: Indicator and Utility Unit Tests

**Files:**
- Create: `frontend/src/__tests__/indicators/sma.test.ts`
- Create: `frontend/src/__tests__/indicators/ema.test.ts`
- Create: `frontend/src/__tests__/indicators/bollinger.test.ts`
- Create: `frontend/src/__tests__/indicators/rsi.test.ts`
- Create: `frontend/src/__tests__/indicators/volumeProfile.test.ts`

**Interfaces:**
- Produces: Test suite validating indicator math against known values from spec appendix B1-B5

## SMA Tests

```typescript
import { describe, it, expect } from 'vitest';
import { calculateSMA } from '@/lib/indicators';

describe('Simple Moving Average', () => {
  it('calculates SMA correctly for a basic dataset', () => {
    const prices = [100, 102, 104, 103, 105, 107, 106, 108, 110, 109];
    const sma5 = calculateSMA(prices, 5);
    // SMA(5) at index 4 = (100+102+104+103+105)/5 = 102.8
    expect(sma5[4]).toBeCloseTo(102.8);
    // SMA(5) at index 9 = (107+106+108+110+109)/5 = 108.0
    expect(sma5[9]).toBeCloseTo(108.0);
  });

  it('returns undefined for periods with insufficient data', () => {
    const prices = [10, 12, 14];
    const sma5 = calculateSMA(prices, 5);
    expect(sma5[0]).toBeUndefined();
    expect(sma5[2]).toBeUndefined();
  });

  it('handles single-element period', () => {
    const prices = [42, 43, 44];
    const sma1 = calculateSMA(prices, 1);
    expect(sma1[0]).toBe(42);
    expect(sma1[2]).toBe(44);
  });
});
```

## EMA Tests

```typescript
import { describe, it, expect } from 'vitest';
import { calculateEMA } from '@/lib/indicators';

describe('Exponential Moving Average', () => {
  it('calculates EMA correctly', () => {
    const prices = [100, 102, 104, 103, 105, 107, 106, 108, 110, 109];
    const ema5 = calculateEMA(prices, 5);
    // EMA(5) at index 4 = SMA(5) = 102.8
    expect(ema5[4]).toBeCloseTo(102.8);
    // EMA(5) at index 5 = (107 - 102.8) * 0.3333 + 102.8 = 104.2
    expect(ema5[5]).toBeCloseTo(104.2, 0);
  });

  it('uses SMA for first value', () => {
    const prices = [10, 20, 30, 40, 50];
    const ema3 = calculateEMA(prices, 3);
    // First EMA = SMA(3) at index 2 = (10+20+30)/3 = 20
    expect(ema3[2]).toBeCloseTo(20);
  });
});
```

## Bollinger Bands Tests

```typescript
import { describe, it, expect } from 'vitest';
import { calculateBollinger } from '@/lib/indicators';

describe('Bollinger Bands', () => {
  it('calculates bands correctly', () => {
    const prices = [100, 102, 104, 103, 105, 107, 106, 108, 110, 109,
                    111, 113, 112, 114, 116, 115, 117, 119, 118, 120];
    const bb = calculateBollinger(prices, 20, 2);
    // Middle band = SMA(20)
    expect(bb.middle[19]).toBeDefined();
    // Upper band > middle > lower
    expect(bb.upper[19]!).toBeGreaterThan(bb.middle[19]!);
    expect(bb.middle[19]!).toBeGreaterThan(bb.lower[19]!);
  });

  it('uses population standard deviation', () => {
    // Financial convention: divide by n, not n-1
    const prices = [10, 20, 30, 40, 50];
    const bb = calculateBollinger(prices, 5, 2);
    const sma = (10+20+30+40+50)/5; // 30
    const variance = ((10-30)**2 + (20-30)**2 + (30-30)**2 + (40-30)**2 + (50-30)**2) / 5;
    const std = Math.sqrt(variance);
    expect(bb.upper[4]).toBeCloseTo(sma + 2 * std);
    expect(bb.lower[4]).toBeCloseTo(sma - 2 * std);
  });
});
```

## RSI Tests

```typescript
import { describe, it, expect } from 'vitest';
import { calculateRSI } from '@/lib/indicators';

describe('Relative Strength Index', () => {
  it('calculates RSI correctly', () => {
    const prices = [44, 44.34, 44.09, 43.61, 44.33, 44.83, 45.10, 45.42, 45.84, 46.08,
                    45.89, 46.03, 45.61, 46.28, 46.28, 46.00, 46.03, 46.41, 46.22, 45.64];
    const rsi = calculateRSI(prices, 14);
    // RSI should be between 0 and 100
    const rsi19 = rsi[19];
    expect(rsi19).toBeDefined();
    expect(rsi19!).toBeGreaterThanOrEqual(0);
    expect(rsi19!).toBeLessThanOrEqual(100);
  });

  it('returns 100 when average loss is 0', () => {
    // All prices going up
    const prices = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
    const rsi = calculateRSI(prices, 14);
    expect(rsi[14]).toBeCloseTo(100);
  });

  it('returns 0 when average gain is 0', () => {
    // All prices going down
    const prices = [24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10];
    const rsi = calculateRSI(prices, 14);
    expect(rsi[14]).toBeCloseTo(0);
  });
});
```

## Volume Profile Tests

```typescript
import { describe, it, expect } from 'vitest';
import { calculateVolumeProfile } from '@/lib/indicators';
import { OHLCV } from '@/types/stock';

describe('Volume Profile', () => {
  it('distributes volume across price buckets', () => {
    const candles: OHLCV[] = [
      { time: 1, open: 100, high: 110, low: 90, close: 105, volume: 1000 },
      { time: 2, open: 105, high: 115, low: 95, close: 110, volume: 2000 },
    ];
    const profile = calculateVolumeProfile(candles, 5);
    expect(profile.priceLevels).toHaveLength(5);
    expect(profile.volumes).toHaveLength(5);
    // Total volume should be distributed
    const totalVolume = profile.volumes.reduce((a, b) => a + b, 0);
    expect(totalVolume).toBeGreaterThan(0);
  });

  it('returns empty for empty candles', () => {
    const profile = calculateVolumeProfile([]);
    expect(profile.priceLevels).toHaveLength(0);
    expect(profile.volumes).toHaveLength(0);
  });
});
```

## Run All Tests

```bash
cd frontend && npx vitest run src/__tests__/indicators/
```

## Step: Commit

```bash
git add src/__tests__/indicators/
git commit -m "test(indicators): add unit tests for SMA, EMA, Bollinger, RSI, Volume Profile"
```
