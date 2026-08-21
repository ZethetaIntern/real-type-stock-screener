import {
  Stock,
  Sector,
  MarketCapCategory,
  OHLCV,
  SECTORS,
  MARKET_CAP_CATEGORIES,
  INDEX_MEMBERSHIP,
  MacdSignal,
  BollingerPosition,
  VolumeVsAvg,
} from '@/types/stock';

const SECTOR_DATA: Record<
  Sector,
  { avgPE: number; avgBeta: number; avgDividend: number; weight: number }
> = {
  IT: { avgPE: 25, avgBeta: 0.85, avgDividend: 1.5, weight: 0.12 },
  Banking: { avgPE: 18.5, avgBeta: 1.1, avgDividend: 1.2, weight: 0.15 },
  Pharma: { avgPE: 30, avgBeta: 0.7, avgDividend: 0.8, weight: 0.1 },
  FMCG: { avgPE: 35, avgBeta: 0.6, avgDividend: 1.8, weight: 0.08 },
  Auto: { avgPE: 22, avgBeta: 1.05, avgDividend: 1.0, weight: 0.07 },
  Metal: { avgPE: 12, avgBeta: 1.4, avgDividend: 2.5, weight: 0.06 },
  Energy: { avgPE: 14, avgBeta: 0.95, avgDividend: 3.0, weight: 0.06 },
  Realty: { avgPE: 20, avgBeta: 1.3, avgDividend: 0.5, weight: 0.07 },
  Telecom: { avgPE: 28, avgBeta: 0.9, avgDividend: 0.3, weight: 0.04 },
  Infrastructure: { avgPE: 18, avgBeta: 1.15, avgDividend: 1.0, weight: 0.08 },
  Media: { avgPE: 16, avgBeta: 1.0, avgDividend: 0.5, weight: 0.04 },
  Others: { avgPE: 16, avgBeta: 1.0, avgDividend: 1.5, weight: 0.13 },
};

const REAL_COMPANIES: Record<Sector, string[]> = {
  IT: ['TCS', 'Infosys', 'Wipro', 'HCL Tech', 'Tech Mahindra', 'Persistent Systems', 'LTIMindtree', 'Mphasis', 'Coffeyville', 'Cyient'],
  Banking: ['HDFC Bank', 'ICICI Bank', 'SBI', 'Kotak Bank', 'Axis Bank', 'IndusInd Bank', 'Bandhan Bank', 'IDFC First', 'Federal Bank', 'Punjab National Bank'],
  Pharma: ['Sun Pharma', 'Dr Reddy', 'Cipla', 'Divi Labs', 'Aurobindo', 'Zydus Lifesciences', 'Cipla', 'Torrent Pharma', 'Lupin', 'Hetero Labs'],
  FMCG: ['HUL', 'ITC', 'Nestle India', 'Dabur', 'Britannia', 'Parle', 'Godrej Consumer', 'Marico', 'Colgate', 'Titan'],
  Auto: ['Maruti Suzuki', 'Tata Motors', 'Mahindra', 'Bajaj Auto', 'Hero MotoCorp', 'Eicher Motors', 'TVS Motor', 'Ashok Leyland', 'Force Motors', 'SML Isuzu'],
  Metal: ['Tata Steel', 'JSW Steel', 'Hindustan Zinc', 'Hindalco', 'NMDC', 'SAIL', 'Vedanta', 'Coal India', 'NMDC', 'MOIL'],
  Energy: ['Reliance', 'ONGC', 'BPCL', 'IOCL', 'HPCL', 'NTPC', 'Power Grid', 'Tata Power', 'Adani Green', 'Adani Power'],
  Realty: ['DLF', 'Godrej Properties', 'Oberoi Realty', 'Prestige Estates', 'Brigade Enterprises', 'Phoenix Mills', 'Macrotech', 'LIC Housing', 'Sunteck Realty', 'Puravankara'],
  Telecom: ['Bharti Airtel', 'Vodafone Idea', 'Reliance Jio', 'Tata Communications', 'Bharti Infratel', 'STER', 'GTPL Hathway', 'Den Networks', ' Siti Networks', 'Indian Railway'],
  Infrastructure: ['L&T', 'Adani Ports', 'GMR Infra', 'IRB Infra', 'KNR Infrastructure', 'HG Infra', 'Ashoka Buildcon', 'Dilip Buildcon', 'IP Rings', 'Texmaco Rail'],
  Media: ['Zee Entertainment', 'PVR', 'INOX', 'Sun TV', 'HT Media', 'Dainik Bhaskar', 'Network18', 'DEN Networks', 'Crompton Greaves', 'Hindustan Media'],
  Others: ['Adani Enterprises', 'Adani Total Gas', 'Adani Wilmar', 'BSE', 'CAMS', 'CCI', 'LIC', 'NMDC', 'RITES', 'Garden Reach'],
};

const INDUSTRIES: Record<Sector, string[]> = {
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

function normalRandom(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSymbol(sector: Sector, index: number): string {
  const prefix = sector.substring(0, 3).toUpperCase();
  return `${prefix}${String(index).padStart(4, '0')}`;
}

function generateCompanyName(sector: Sector, index: number): string {
  const realCompanies = REAL_COMPANIES[sector];
  if (index < realCompanies.length) {
    return realCompanies[index];
  }
  return `${sector} Solutions Ltd`;
}

function generateMarketCap(category: MarketCapCategory): number {
  const ranges: Record<MarketCapCategory, [number, number]> = {
    'Large Cap': [500000000000, 20000000000000],
    'Mid Cap': [100000000000, 499999000000],
    'Small Cap': [10000000000, 99999000000],
    'Micro Cap': [500000000, 9999000000],
  };
  const [min, max] = ranges[category];
  return min + Math.random() * (max - min);
}

function categoriseByMarketCap(marketCap: number): MarketCapCategory {
  if (marketCap >= 500000000000) return 'Large Cap';
  if (marketCap >= 100000000000) return 'Mid Cap';
  if (marketCap >= 10000000000) return 'Small Cap';
  return 'Micro Cap';
}

function assignIndices(marketCap: number): string[] {
  const indices: string[] = [];
  if (marketCap >= 500000000000) {
    indices.push('NIFTY 50');
    if (Math.random() > 0.3) indices.push('BSE Sensex');
  }
  if (marketCap >= 100000000000 && marketCap < 500000000000) {
    indices.push('NIFTY Next 50');
  }
  if (marketCap >= 200000000000 && marketCap < 5000000000000) {
    indices.push('NIFTY Midcap 100');
  }
  if (marketCap >= 50000000000) {
    indices.push('NIFTY Smallcap 250');
  }
  return indices;
}

export function generateMockStocks(count: number = 5000): Stock[] {
  const stocks: Stock[] = [];
  const sectorCounts: Record<Sector, number> = {} as Record<Sector, number>;

  for (const sector of SECTORS) {
    sectorCounts[sector] = 0;
  }

  for (let i = 0; i < count; i++) {
    const sectorWeights = SECTORS.map((s) => SECTOR_DATA[s].weight);
    const totalWeight = sectorWeights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    let selectedSector: Sector = 'Others';

    for (const sector of SECTORS) {
      random -= SECTOR_DATA[sector].weight;
      if (random <= 0) {
        selectedSector = sector;
        break;
      }
    }

    const sectorInfo = SECTOR_DATA[selectedSector];
    const marketCap = generateMarketCap(randomChoice(MARKET_CAP_CATEGORIES));
    const capCategory = categoriseByMarketCap(marketCap);

    let basePrice: number;
    if (marketCap >= 500000000000) {
      basePrice = 500 + Math.random() * 4000;
    } else if (marketCap >= 100000000000) {
      basePrice = 100 + Math.random() * 2000;
    } else if (marketCap >= 10000000000) {
      basePrice = 50 + Math.random() * 500;
    } else {
      basePrice = 10 + Math.random() * 200;
    }

    const pe = sectorInfo.avgPE * (0.5 + Math.random());
    const pb = pe / 5;
    const eps = basePrice / (pe || 20);
    const beta = clamp(sectorInfo.avgBeta + normalRandom() * 0.3, 0.3, 2.5);
    const roe = clamp(10 + normalRandom() * 25, -20, 60);
    const roce = clamp(roe + normalRandom() * 10, -20, 80);
    const debtToEquity =
      selectedSector === 'Banking'
        ? 5 + Math.random() * 10
        : selectedSector === 'FMCG' || selectedSector === 'IT'
          ? Math.random() * 0.5
          : 0.5 + Math.random() * 2;
    const currentRatio = 0.5 + Math.random() * 3;
    const promoterHolding = clamp(
      capCategory === 'Large Cap' ? 50 + Math.random() * 25 : 30 + Math.random() * 60,
      20,
      90
    );
    const revenueGrowth = clamp(-20 + normalRandom() * 50, -50, 100);
    const profitGrowth = clamp(-30 + normalRandom() * 80, -80, 200);
    const dividendYield = clamp(sectorInfo.avgDividend + normalRandom() * 1.5, 0, 10);
    const volume = Math.round(100000 + Math.random() * 50000000);
    const avgVolume = Math.round(volume * (0.8 + Math.random() * 0.4));
    const rsi14 = clamp(30 + Math.random() * 50, 10, 90);
    const sma50 = basePrice * (0.9 + Math.random() * 0.2);
    const sma200 = basePrice * (0.8 + Math.random() * 0.4);
    const atr = basePrice * 0.02 * (0.5 + Math.random());
    const week52High = basePrice * (1.1 + Math.random() * 0.5);
    const week52Low = basePrice * (0.5 + Math.random() * 0.4);
    const changePercent = (Math.random() - 0.5) * 10;

    let macdSignal: MacdSignal = 'Neutral';
    if (changePercent > 1) macdSignal = 'Bullish';
    else if (changePercent < -1) macdSignal = 'Bearish';

    let bollingerPosition: BollingerPosition = 'Within';
    if (basePrice > sma200 * 1.02) bollingerPosition = 'Above';
    else if (basePrice < sma200 * 0.98) bollingerPosition = 'Below';

    let volumeVsAvg: VolumeVsAvg = 'Above';
    const volRatio = volume / avgVolume;
    if (volRatio < 0.9) volumeVsAvg = 'Below';
    else if (volRatio > 2) volumeVsAvg = '2x';
    else if (volRatio > 3) volumeVsAvg = '3x';

    const changeAbsolute = basePrice * (changePercent / 100);
    const dayChange = changeAbsolute;
    const intradayVolatility = basePrice * 0.01 * (0.5 + Math.random());

    stocks.push({
      symbol: generateSymbol(selectedSector, sectorCounts[selectedSector]++),
      companyName: generateCompanyName(selectedSector, sectorCounts[selectedSector]),
      sector: selectedSector,
      industry: randomChoice(INDUSTRIES[selectedSector]),
      marketCapCategory: capCategory,
      indexMembership: assignIndices(marketCap),
      lastPrice: round2(basePrice),
      previousClose: round2(basePrice - dayChange),
      dayOpen: round2(basePrice - dayChange + (Math.random() - 0.5) * intradayVolatility),
      dayHigh: round2(basePrice + Math.abs(normalRandom()) * intradayVolatility),
      dayLow: round2(basePrice - Math.abs(normalRandom()) * intradayVolatility),
      changePercent: round2(changePercent),
      changeAbsolute: round2(changeAbsolute),
      volume,
      avgVolume20D: avgVolume,
      week52High: round2(week52High),
      week52Low: round2(week52Low),
      marketCap,
      pe: round2(pe),
      pb: round2(pb),
      dividendYield: round2(dividendYield),
      eps: round2(eps),
      roe: round2(roe),
      roce: round2(roce),
      debtToEquity: round2(debtToEquity),
      currentRatio: round2(currentRatio),
      promoterHolding: round2(promoterHolding),
      revenueGrowthYoY: round2(revenueGrowth),
      profitGrowthYoY: round2(profitGrowth),
      rsi14: round2(rsi14),
      sma50: round2(sma50),
      sma200: round2(sma200),
      beta: round2(beta),
      atr: round2(atr),
      macdSignal,
      bollingerPosition,
      volumeVsAvg,
    });
  }

  return stocks;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function generateOHLCV(
  startPrice: number,
  days: number = 252,
  volatility: number = 0.02,
  avgVolume: number = 1000000
): OHLCV[] {
  const candles: OHLCV[] = [];
  let currentPrice = startPrice;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days * 2);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dailyReturn = normalRandom() * volatility;
    const open = currentPrice;
    const intraday1 = open * (1 + normalRandom() * volatility * 0.5);
    const intraday2 = open * (1 + normalRandom() * volatility * 0.5);
    const close = open * (1 + dailyReturn);
    const high = Math.max(open, close, intraday1, intraday2) * (1 + Math.abs(normalRandom()) * 0.005);
    const low = Math.min(open, close, intraday1, intraday2) * (1 - Math.abs(normalRandom()) * 0.005);
    const volumeMultiplier = 1 + Math.abs(dailyReturn) * 10;
    const volume = Math.round(avgVolume * volumeMultiplier * (0.5 + Math.random()));

    candles.push({
      time: Math.floor(date.getTime() / 1000),
      open: round2(open),
      high: round2(high),
      low: round2(low),
      close: round2(close),
      volume,
    });

    currentPrice = close;
  }

  return candles;
}

const stockCache = new Map<string, { data: Stock[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export function getStockUniverse(count: number = 5000): Stock[] {
  const cached = stockCache.get('universe');
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const stocks = generateMockStocks(count);
  stockCache.set('universe', { data: stocks, timestamp: Date.now() });
  return stocks;
}

export function simulateNextPrice(
  currentPrice: number,
  volatility: number = 0.02,
  drift: number = 0.0001
): number {
  const dt = 1 / 252;
  const randomShock = Math.sqrt(dt) * normalRandom();
  const priceChange = drift * dt + volatility * randomShock;
  return currentPrice * (1 + priceChange);
}

export function simulateSectorMovement(
  stocks: Stock[],
  sectorCorrelation: number = 0.6
): Map<string, number> {
  const sectorShock = normalRandom();
  const updates = new Map<string, number>();

  for (const stock of stocks) {
    const idiosyncratic = normalRandom();
    const combinedShock =
      sectorCorrelation * sectorShock +
      Math.sqrt(1 - sectorCorrelation ** 2) * idiosyncratic;
    const volatility = stock.beta * 0.02;
    const dt = 1 / 252;
    const drift = 0.0001;
    const priceChange = drift * dt + volatility * Math.sqrt(dt) * combinedShock;
    const newPrice = stock.lastPrice * (1 + priceChange);
    updates.set(stock.symbol, Math.round(newPrice * 100) / 100);
  }

  return updates;
}