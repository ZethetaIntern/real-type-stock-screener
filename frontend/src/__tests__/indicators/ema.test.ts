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
