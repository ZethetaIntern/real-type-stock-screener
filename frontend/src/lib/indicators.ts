import { OHLCV } from '@/types/stock';

export function calculateSMA(prices: number[], period: number): (number | undefined)[] {
  const result: (number | undefined)[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      result.push(undefined);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += prices[i - j];
      }
      result.push(sum / period);
    }
  }

  return result;
}

export function calculateEMA(prices: number[], period: number): (number | undefined)[] {
  const result: (number | undefined)[] = [];
  const multiplier = 2 / (period + 1);

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      result.push(undefined);
    } else if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += prices[i - j];
      }
      result.push(sum / period);
    } else {
      const prevEma = result[i - 1] as number;
      const ema = (prices[i] - prevEma) * multiplier + prevEma;
      result.push(ema);
    }
  }

  return result;
}

export interface BollingerBands {
  upper: (number | undefined)[];
  middle: (number | undefined)[];
  lower: (number | undefined)[];
}

export function calculateBollinger(prices: number[], period: number = 20, stdDev: number = 2): BollingerBands {
  const sma = calculateSMA(prices, period);
  const upper: (number | undefined)[] = [];
  const middle: (number | undefined)[] = [];
  const lower: (number | undefined)[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      upper.push(undefined);
      middle.push(undefined);
      lower.push(undefined);
    } else {
      const smaVal = sma[i] as number;
      let sumSquaredDiff = 0;
      for (let j = 0; j < period; j++) {
        sumSquaredDiff += Math.pow(prices[i - j] - smaVal, 2);
      }
      const std = Math.sqrt(sumSquaredDiff / period);
      middle.push(smaVal);
      upper.push(smaVal + stdDev * std);
      lower.push(smaVal - stdDev * std);
    }
  }

  return { upper, middle, lower };
}

export function calculateRSI(prices: number[], period: number = 14): (number | undefined)[] {
  const result: (number | undefined)[] = [];
  const changes: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i === 0) {
      changes.push(0);
      result.push(undefined);
      continue;
    }

    const change = prices[i] - prices[i - 1];
    changes.push(change);
    result.push(undefined);
  }

  if (prices.length < period + 1) {
    return result;
  }

  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 1; i <= period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i];
    } else {
      avgLoss += Math.abs(changes[i]);
    }
  }

  avgGain /= period;
  avgLoss /= period;

  for (let i = period; i < prices.length; i++) {
    if (i > period) {
      const change = changes[i];
      if (change > 0) {
        avgGain = (avgGain * (period - 1) + change) / period;
        avgLoss = (avgLoss * (period - 1)) / period;
      } else {
        avgGain = (avgGain * (period - 1)) / period;
        avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
      }
    }

    if (avgLoss === 0) {
      result[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      result[i] = 100 - 100 / (1 + rs);
    }
  }

  return result;
}

export interface VolumeProfile {
  priceLevels: number[];
  volumes: number[];
}

export function calculateVolumeProfile(candles: OHLCV[], bucketCount: number = 30): VolumeProfile {
  if (candles.length === 0) {
    return { priceLevels: [], volumes: [] };
  }

  let minPrice = Infinity;
  let maxPrice = -Infinity;

  for (const candle of candles) {
    if (candle.low < minPrice) minPrice = candle.low;
    if (candle.high > maxPrice) maxPrice = candle.high;
  }

  const bucketSize = (maxPrice - minPrice) / bucketCount;
  const volumes = new Array(bucketCount).fill(0);
  const priceLevels: number[] = [];

  for (let i = 0; i < bucketCount; i++) {
    priceLevels.push(minPrice + bucketSize * (i + 0.5));
  }

  for (const candle of candles) {
    const lowestBucket = Math.floor((candle.low - minPrice) / bucketSize);
    const highestBucket = Math.floor((candle.high - minPrice) / bucketSize);

    for (let i = lowestBucket; i <= highestBucket && i < bucketCount; i++) {
      if (i >= 0) {
        volumes[i] += candle.volume / (highestBucket - lowestBucket + 1);
      }
    }
  }

  return { priceLevels, volumes };
}

export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: (number | undefined)[]; signal: (number | undefined)[]; histogram: (number | undefined)[] } {
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);

  const macd: (number | undefined)[] = [];
  const signal: (number | undefined)[] = [];
  const histogram: (number | undefined)[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (fastEMA[i] === undefined || slowEMA[i] === undefined) {
      macd.push(undefined);
      signal.push(undefined);
      histogram.push(undefined);
    } else {
      macd.push(fastEMA[i]! - slowEMA[i]!);
    }
  }

  const macdValues = macd.filter((v): v is number => v !== undefined);
  const signalEMA = calculateEMA(macdValues, signalPeriod);

  let signalIdx = 0;
  for (let i = 0; i < prices.length; i++) {
    if (macd[i] === undefined) {
      signal.push(undefined);
      histogram.push(undefined);
    } else {
      if (signalIdx < signalEMA.length && signalEMA[signalIdx] !== undefined) {
        signal.push(signalEMA[signalIdx]);
        histogram.push(macd[i]! - signalEMA[signalIdx]!);
        signalIdx++;
      }
    }
  }

  return { macd, signal, histogram };
}