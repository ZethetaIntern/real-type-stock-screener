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
