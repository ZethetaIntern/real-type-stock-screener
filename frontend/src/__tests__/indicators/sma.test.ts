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
