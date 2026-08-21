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
