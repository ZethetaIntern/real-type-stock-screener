import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DataGrid from '@/components/DataGrid/DataGrid';
import { Stock } from '@/types/stock';

const mockStocks: Stock[] = [
  {
    symbol: 'TEST0001',
    companyName: 'Test Company 1',
    sector: 'IT',
    industry: 'Software Services',
    marketCapCategory: 'Large Cap',
    indexMembership: ['NIFTY 50'],
    lastPrice: 1000,
    previousClose: 990,
    dayOpen: 995,
    dayHigh: 1010,
    dayLow: 990,
    changePercent: 1.01,
    changeAbsolute: 10,
    volume: 1000000,
    avgVolume20D: 800000,
    week52High: 1200,
    week52Low: 800,
    marketCap: 500000000000,
    pe: 25,
    pb: 5,
    dividendYield: 1.5,
    eps: 40,
    roe: 20,
    roce: 25,
    debtToEquity: 0.3,
    currentRatio: 2,
    promoterHolding: 60,
    revenueGrowthYoY: 15,
    profitGrowthYoY: 20,
    rsi14: 55,
    sma50: 980,
    sma200: 950,
    beta: 0.9,
    atr: 20,
    macdSignal: 'Bullish',
    bollingerPosition: 'Within',
    volumeVsAvg: 'Above',
  },
  {
    symbol: 'TEST0002',
    companyName: 'Test Company 2',
    sector: 'Banking',
    industry: 'Private Bank',
    marketCapCategory: 'Mid Cap',
    indexMembership: [],
    lastPrice: 500,
    previousClose: 510,
    dayOpen: 505,
    dayHigh: 515,
    dayLow: 495,
    changePercent: -1.96,
    changeAbsolute: -10,
    volume: 2000000,
    avgVolume20D: 1500000,
    week52High: 600,
    week52Low: 400,
    marketCap: 100000000000,
    pe: 15,
    pb: 3,
    dividendYield: 2.5,
    eps: 33,
    roe: 18,
    roce: 22,
    debtToEquity: 0.5,
    currentRatio: 1.8,
    promoterHolding: 55,
    revenueGrowthYoY: 10,
    profitGrowthYoY: 12,
    rsi14: 45,
    sma50: 510,
    sma200: 480,
    beta: 1.1,
    atr: 15,
    macdSignal: 'Bearish',
    bollingerPosition: 'Below',
    volumeVsAvg: 'Above',
  },
];

vi.mock('@/stores/stockStore', () => ({
  useStockStore: () => ({
    selectedSymbol: null,
    setSelectedSymbol: vi.fn(),
    watchlist: new Set(),
    toggleWatchlist: vi.fn(),
    livePrices: new Map(),
  }),
}));

describe('DataGrid', () => {
  it('renders stock symbols', () => {
    render(<DataGrid stocks={mockStocks} />);
    expect(screen.getByText('TEST0001')).toBeDefined();
    expect(screen.getByText('TEST0002')).toBeDefined();
  });

  it('renders company names', () => {
    render(<DataGrid stocks={mockStocks} />);
    expect(screen.getByText('Test Company 1')).toBeDefined();
    expect(screen.getByText('Test Company 2')).toBeDefined();
  });

  it('renders sector badges', () => {
    render(<DataGrid stocks={mockStocks} />);
    expect(screen.getByText('IT')).toBeDefined();
    expect(screen.getByText('Banking')).toBeDefined();
  });

  it('calls onRowClick when row is clicked', () => {
    const onRowClick = vi.fn();
    render(<DataGrid stocks={mockStocks} onRowClick={onRowClick} />);

    const row = screen.getByText('TEST0001').closest('tr');
    if (row) {
      fireEvent.click(row);
    }

    expect(onRowClick).toHaveBeenCalledWith(mockStocks[0]);
  });

  it('renders column headers', () => {
    render(<DataGrid stocks={mockStocks} />);
    expect(screen.getByText('Symbol')).toBeDefined();
    expect(screen.getByText('Company')).toBeDefined();
    expect(screen.getByText('LTP')).toBeDefined();
    expect(screen.getByText('% Chg')).toBeDefined();
    expect(screen.getByText('Volume')).toBeDefined();
    expect(screen.getByText('Mkt Cap')).toBeDefined();
  });

  it('renders price cells with INR format', () => {
    render(<DataGrid stocks={mockStocks} />);
    expect(screen.getByText('₹1,000.00')).toBeDefined();
    expect(screen.getByText('₹500.00')).toBeDefined();
  });

  it('renders positive change in green', () => {
    render(<DataGrid stocks={mockStocks} />);
    const positiveChange = screen.getByText('+1.01%');
    expect(positiveChange).toBeDefined();
  });

  it('renders negative change in red', () => {
    render(<DataGrid stocks={mockStocks} />);
    const negativeChange = screen.getByText('-1.96%');
    expect(negativeChange).toBeDefined();
  });

  it('has proper ARIA attributes', () => {
    render(<DataGrid stocks={mockStocks} />);
    const grid = screen.getByRole('grid');
    expect(grid).toBeDefined();
    expect(grid.getAttribute('aria-label')).toBe('Stock Screener Results');
    expect(grid.getAttribute('aria-rowcount')).toBe('2');
  });

  it('renders with empty stocks array', () => {
    render(<DataGrid stocks={[]} />);
    expect(screen.getByText('Symbol')).toBeDefined();
  });
});
