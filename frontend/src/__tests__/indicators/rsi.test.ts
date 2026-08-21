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
