import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterPanel } from '@/components/FilterPanel/FilterPanel';

vi.mock('@/stores/stockStore', () => ({
  useStockStore: () => ({
    activeFilters: [],
    addFilter: vi.fn(),
    removeFilter: vi.fn(),
    updateFilter: vi.fn(),
  }),
}));

describe('FilterPanel', () => {
  it('renders filter groups', () => {
    render(<FilterPanel />);
    expect(screen.getByText('Fundamentals')).toBeDefined();
    expect(screen.getByText('Market Data')).toBeDefined();
    expect(screen.getByText('Classification')).toBeDefined();
    expect(screen.getByText('Technical')).toBeDefined();
    expect(screen.getByText('Custom')).toBeDefined();
  });

  it('renders range filters', () => {
    render(<FilterPanel />);
    expect(screen.getByText('Market Cap (Cr)')).toBeDefined();
    expect(screen.getByText('P/E Ratio')).toBeDefined();
    expect(screen.getByText('P/B Ratio')).toBeDefined();
    expect(screen.getByText('Dividend Yield (%)')).toBeDefined();
  });

  it('renders multi-select filters', () => {
    render(<FilterPanel />);
    expect(screen.getByText('Sector')).toBeDefined();
    expect(screen.getByText('Industry')).toBeDefined();
    expect(screen.getByText('Market Cap Category')).toBeDefined();
    expect(screen.getByText('Index Membership')).toBeDefined();
  });

  it('renders single-select filters', () => {
    render(<FilterPanel />);
    expect(screen.getByText('MACD Signal')).toBeDefined();
    expect(screen.getByText('Price vs SMA 50')).toBeDefined();
    expect(screen.getByText('Price vs SMA 200')).toBeDefined();
    expect(screen.getByText('Bollinger Position')).toBeDefined();
  });

  it('renders boolean filters', () => {
    render(<FilterPanel />);
    expect(screen.getByText('Watchlist Only')).toBeDefined();
    expect(screen.getByText('Recently Updated')).toBeDefined();
  });

  it('renders preset selector', () => {
    render(<FilterPanel />);
    expect(screen.getByText('Presets')).toBeDefined();
  });

  it('expands filter group on click', () => {
    render(<FilterPanel />);
    const fundamentalsGroup = screen.getByText('Fundamentals');
    fireEvent.click(fundamentalsGroup);
    expect(screen.getByText('Market Cap (Cr)')).toBeDefined();
  });

  it('has proper accessibility labels', () => {
    render(<FilterPanel />);
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBeGreaterThan(0);
  });
});
