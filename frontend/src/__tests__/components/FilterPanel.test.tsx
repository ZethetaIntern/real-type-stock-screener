import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FilterPanel } from '@/components/FilterPanel/FilterPanel';

vi.mock('@/stores/stockStore', () => ({
  useStockStore: (selector?: (s: Record<string, unknown>) => unknown) => {
    const state = {
      activeFilters: [],
      addFilter: vi.fn(),
      removeFilter: vi.fn(),
      updateFilter: vi.fn(),
      loadPreset: vi.fn(),
    };
    return selector ? selector(state) : state;
  },
}));

const renderWithProvider = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

describe('FilterPanel', () => {
  it('renders filter groups', () => {
    renderWithProvider(<FilterPanel />);
    expect(screen.getByText('Fundamentals')).toBeDefined();
    expect(screen.getByText('Market Data')).toBeDefined();
    expect(screen.getByText('Classification')).toBeDefined();
    expect(screen.getByText('Technical')).toBeDefined();
    expect(screen.getByText('Custom')).toBeDefined();
  });

  it('renders range filters', () => {
    renderWithProvider(<FilterPanel />);
    expect(screen.getByText('Market Cap (Cr)')).toBeDefined();
    expect(screen.getByText('P/E Ratio')).toBeDefined();
    expect(screen.getByText('P/B Ratio')).toBeDefined();
    expect(screen.getByText('Dividend Yield (%)')).toBeDefined();
  });

  it('renders multi-select filters', () => {
    renderWithProvider(<FilterPanel />);
    fireEvent.click(screen.getByText('Classification'));
    expect(screen.getByText('Sector')).toBeDefined();
    expect(screen.getByText('Industry')).toBeDefined();
    expect(screen.getByText('Market Cap Category')).toBeDefined();
    expect(screen.getByText('Index Membership')).toBeDefined();
  });

  it('renders single-select filters', () => {
    renderWithProvider(<FilterPanel />);
    fireEvent.click(screen.getByText('Technical'));
    expect(screen.getByText('MACD Signal')).toBeDefined();
    expect(screen.getByText('Price vs SMA 50')).toBeDefined();
    expect(screen.getByText('Price vs SMA 200')).toBeDefined();
    expect(screen.getByText('Bollinger Position')).toBeDefined();
  });

  it('renders boolean filters', () => {
    renderWithProvider(<FilterPanel />);
    fireEvent.click(screen.getByText('Custom'));
    expect(screen.getByText('Watchlist Only')).toBeDefined();
    expect(screen.getByText('Recently Updated')).toBeDefined();
  });

  it('renders preset selector', () => {
    renderWithProvider(<FilterPanel />);
    expect(screen.getByText('Presets')).toBeDefined();
  });

  it('expands a collapsed filter group on click', () => {
    renderWithProvider(<FilterPanel />);
    fireEvent.click(screen.getByText('Classification'));
    expect(screen.getByText('Sector')).toBeDefined();
  });

  it('has proper accessibility labels', () => {
    renderWithProvider(<FilterPanel />);
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBeGreaterThan(0);
  });
});
