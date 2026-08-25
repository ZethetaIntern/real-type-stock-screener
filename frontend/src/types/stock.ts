export type Sector =
  | 'IT'
  | 'Banking'
  | 'Pharma'
  | 'Auto'
  | 'FMCG'
  | 'Metal'
  | 'Energy'
  | 'Realty'
  | 'Telecom'
  | 'Infrastructure'
  | 'Media'
  | 'Others';

export type MarketCapCategory = 'Large Cap' | 'Mid Cap' | 'Small Cap' | 'Micro Cap';

export type MacdSignal = 'Bullish' | 'Bearish' | 'Neutral';
export type BollingerPosition = 'Above' | 'Within' | 'Below';
export type VolumeVsAvg = 'Below' | 'Above' | '2x' | '3x';

export interface Stock {
  symbol: string;
  companyName: string;
  sector: Sector;
  industry: string;
  marketCapCategory: MarketCapCategory;
  indexMembership: string[];
  lastPrice: number;
  previousClose: number;
  dayOpen: number;
  dayHigh: number;
  dayLow: number;
  changePercent: number;
  changeAbsolute: number;
  volume: number;
  avgVolume20D: number;
  week52High: number;
  week52Low: number;
  marketCap: number;
  pe: number | null;
  pb: number;
  dividendYield: number;
  eps: number;
  roe: number;
  roce: number;
  debtToEquity: number;
  currentRatio: number;
  promoterHolding: number;
  revenueGrowthYoY: number;
  profitGrowthYoY: number;
  rsi14: number;
  sma50: number;
  sma200: number;
  beta: number;
  atr: number;
  macdSignal: MacdSignal;
  bollingerPosition: BollingerPosition;
  volumeVsAvg: VolumeVsAvg;
  watchlistOnly?: boolean;
  recentlyUpdated?: boolean;
}

export interface OHLCV {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type FilterOperator =
  'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'in' | 'notIn' | 'contains';

export type FilterValue = number | string | boolean | number[] | string[];

export interface FilterConfig {
  id: string;
  field: keyof Stock;
  operator: FilterOperator;
  value: FilterValue;
  enabled: boolean;
}

export interface SortConfig {
  column: keyof Stock;
  direction: 'asc' | 'desc';
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

export interface IndicatorConfig {
  type: 'SMA' | 'EMA' | 'Bollinger' | 'RSI' | 'VolumeProfile';
  enabled: boolean;
  params: Record<string, number>;
}

export const SECTORS: Sector[] = [
  'IT',
  'Banking',
  'Pharma',
  'Auto',
  'FMCG',
  'Metal',
  'Energy',
  'Realty',
  'Telecom',
  'Infrastructure',
  'Media',
  'Others',
];

export const MARKET_CAP_CATEGORIES: MarketCapCategory[] = [
  'Large Cap',
  'Mid Cap',
  'Small Cap',
  'Micro Cap',
];

export const INDEX_MEMBERSHIP = [
  'NIFTY 50',
  'NIFTY Next 50',
  'NIFTY Midcap 100',
  'NIFTY Smallcap 250',
  'BSE Sensex',
];

export const INDUSTRIES: Record<Sector, string[]> = {
  IT: ['Software Services', 'IT Consulting', 'BPO', 'Hardware', 'Semiconductors'],
  Banking: ['Private Bank', 'Public Bank', 'NBFC', 'Insurance', 'Asset Management'],
  Pharma: ['Generic Drugs', 'API', 'Formulations', 'Biotech', 'Herbal'],
  FMCG: ['Personal Care', 'Food Products', 'Household Care', 'Beverages', 'Tobacco'],
  Auto: ['Automobiles', 'Auto Components', 'Two Wheelers', 'Commercial Vehicles', 'Tractors'],
  Metal: ['Steel', 'Aluminium', 'Copper', 'Mining', 'Ferro Alloys'],
  Energy: ['Oil & Gas', 'Power Generation', 'Power Distribution', 'Renewable Energy', 'Coal'],
  Realty: ['Real Estate', 'Construction', 'Infrastructure', 'Cement', 'Building Materials'],
  Telecom: [
    'Telecom Services',
    'Tower Infrastructure',
    'Network Equipment',
    'Content Providers',
    'Cable TV',
  ],
  Infrastructure: ['EPC', 'Roads', 'Highways', 'Bridges', 'Urban Infrastructure'],
  Media: [
    'Media & Entertainment',
    'Broadcasting',
    'Publishing',
    'Digital Media',
    'Film Production',
  ],
  Others: ['Diversified', 'Trading', 'Financial Services', 'Logistics', 'Textiles'],
};
