'use client';
import { useStockStore } from '@/stores/stockStore';
import { SECTORS, INDEX_MEMBERSHIP, INDUSTRIES, FilterConfig, FilterOperator } from '@/types/stock';
import { FilterGroup } from './FilterGroup';
import { RangeFilter } from './RangeFilter';
import { MultiSelectFilter } from './MultiSelectFilter';
import { SingleSelectFilter } from './SingleSelectFilter';
import { BooleanFilter } from './BooleanFilter';
import { PresetSelector } from './PresetSelector';
import { ActiveFilterChips } from './ActiveFilterChips';
import SimpleBar from 'simplebar-react';

export function FilterPanel() {
  const { activeFilters, addFilter, removeFilter, updateFilter } = useStockStore();

  const getFilterValue = (field: string) => activeFilters.find((f) => f.field === field);

  const setRangeFilter = (field: string, range: [number, number]) => {
    const existing = getFilterValue(field);
    if (existing) {
      updateFilter(existing.id, { value: range });
    } else {
      addFilter({
        id: `${field}-${Date.now()}`,
        field: field as FilterConfig['field'],
        operator: 'between',
        value: range,
        enabled: true,
      });
    }
  };

  const setMultiSelectFilter = (field: string, selected: string[]) => {
    const existing = getFilterValue(field);
    if (selected.length === 0) {
      if (existing) removeFilter(existing.id);
      return;
    }
    if (existing) {
      updateFilter(existing.id, { value: selected, operator: 'in' as FilterOperator });
    } else {
      addFilter({
        id: `${field}-${Date.now()}`,
        field: field as FilterConfig['field'],
        operator: 'in',
        value: selected,
        enabled: true,
      });
    }
  };

  const setSingleSelectFilter = (field: string, value: string | null) => {
    const existing = getFilterValue(field);
    if (value === null) {
      if (existing) removeFilter(existing.id);
      return;
    }
    if (existing) {
      updateFilter(existing.id, { value });
    } else {
      addFilter({
        id: `${field}-${Date.now()}`,
        field: field as FilterConfig['field'],
        operator: 'eq',
        value,
        enabled: true,
      });
    }
  };

  const setBooleanFilter = (field: string, value: boolean) => {
    const existing = getFilterValue(field);
    if (!value) {
      if (existing) removeFilter(existing.id);
      return;
    }
    if (existing) {
      updateFilter(existing.id, { value });
    } else {
      addFilter({
        id: `${field}-${Date.now()}`,
        field: field as FilterConfig['field'],
        operator: 'eq',
        value,
        enabled: true,
      });
    }
  };

  const allIndustries = Object.values(INDUSTRIES).flat();

  return (
    <div className="w-80 h-full">
      <SimpleBar className="h-full" style={{ maxHeight: '100%' }}>
        <div className="p-2">
          <PresetSelector />
          <ActiveFilterChips />

          <FilterGroup title="Fundamentals" defaultOpen>
            <RangeFilter
              label="Market Cap (Cr)"
              min={0}
              max={5000000}
              step={1000}
              onChange={(v) => setRangeFilter('marketCap', v)}
              unit="Cr"
            />
            <RangeFilter
              label="P/E Ratio"
              min={-100}
              max={500}
              onChange={(v) => setRangeFilter('pe', v)}
            />
            <RangeFilter
              label="P/B Ratio"
              min={0}
              max={100}
              onChange={(v) => setRangeFilter('pb', v)}
            />
            <RangeFilter
              label="Dividend Yield (%)"
              min={0}
              max={25}
              onChange={(v) => setRangeFilter('dividendYield', v)}
              unit="%"
            />
            <RangeFilter
              label="EPS"
              min={-500}
              max={5000}
              onChange={(v) => setRangeFilter('eps', v)}
            />
            <RangeFilter
              label="ROE (%)"
              min={-100}
              max={200}
              onChange={(v) => setRangeFilter('roe', v)}
              unit="%"
            />
            <RangeFilter
              label="ROCE (%)"
              min={-100}
              max={200}
              onChange={(v) => setRangeFilter('roce', v)}
              unit="%"
            />
            <RangeFilter
              label="Debt/Equity"
              min={0}
              max={10}
              step={0.1}
              onChange={(v) => setRangeFilter('debtToEquity', v)}
            />
            <RangeFilter
              label="Current Ratio"
              min={0}
              max={20}
              step={0.1}
              onChange={(v) => setRangeFilter('currentRatio', v)}
            />
            <RangeFilter
              label="Promoter Holding (%)"
              min={0}
              max={100}
              onChange={(v) => setRangeFilter('promoterHolding', v)}
              unit="%"
            />
            <RangeFilter
              label="Revenue Growth YoY (%)"
              min={-100}
              max={500}
              onChange={(v) => setRangeFilter('revenueGrowthYoY', v)}
              unit="%"
            />
            <RangeFilter
              label="Profit Growth YoY (%)"
              min={-100}
              max={1000}
              onChange={(v) => setRangeFilter('profitGrowthYoY', v)}
              unit="%"
            />
          </FilterGroup>

          <FilterGroup title="Market Data">
            <RangeFilter
              label="LTP (₹)"
              min={0}
              max={500000}
              onChange={(v) => setRangeFilter('lastPrice', v)}
              unit="₹"
            />
            <RangeFilter
              label="52W High Proximity (%)"
              min={0}
              max={100}
              onChange={(v) => setRangeFilter('week52High', v)}
              unit="%"
            />
            <RangeFilter
              label="52W Low Proximity (%)"
              min={0}
              max={100}
              onChange={(v) => setRangeFilter('week52Low', v)}
              unit="%"
            />
            <RangeFilter
              label="Avg Volume (20D)"
              min={0}
              max={100000000}
              step={10000}
              onChange={(v) => setRangeFilter('avgVolume20D', v)}
            />
            <RangeFilter
              label="Beta"
              min={-2}
              max={5}
              step={0.1}
              onChange={(v) => setRangeFilter('beta', v)}
            />
            <RangeFilter
              label="Day Change (%)"
              min={-20}
              max={20}
              step={0.1}
              onChange={(v) => setRangeFilter('changePercent', v)}
              unit="%"
            />
          </FilterGroup>

          <FilterGroup title="Classification">
            <MultiSelectFilter
              label="Sector"
              options={[...SECTORS]}
              selected={(getFilterValue('sector')?.value as string[]) || []}
              onChange={(v) => setMultiSelectFilter('sector', v)}
            />
            <MultiSelectFilter
              label="Industry"
              options={allIndustries}
              selected={(getFilterValue('industry')?.value as string[]) || []}
              onChange={(v) => setMultiSelectFilter('industry', v)}
            />
            <MultiSelectFilter
              label="Market Cap Category"
              options={['Large Cap', 'Mid Cap', 'Small Cap', 'Micro Cap']}
              selected={(getFilterValue('marketCapCategory')?.value as string[]) || []}
              onChange={(v) => setMultiSelectFilter('marketCapCategory', v)}
            />
            <MultiSelectFilter
              label="Index Membership"
              options={[...INDEX_MEMBERSHIP]}
              selected={(getFilterValue('indexMembership')?.value as string[]) || []}
              onChange={(v) => setMultiSelectFilter('indexMembership', v)}
            />
          </FilterGroup>

          <FilterGroup title="Technical">
            <RangeFilter
              label="RSI (14)"
              min={0}
              max={100}
              onChange={(v) => setRangeFilter('rsi14', v)}
            />
            <RangeFilter label="ATR" min={0} max={500} onChange={(v) => setRangeFilter('atr', v)} />
            <SingleSelectFilter
              label="MACD Signal"
              options={['Bullish', 'Bearish', 'Neutral']}
              selected={(getFilterValue('macdSignal')?.value as string) || null}
              onChange={(v) => setSingleSelectFilter('macdSignal', v)}
            />
            <SingleSelectFilter
              label="Price vs SMA 50"
              options={['Above', 'Below']}
              selected={(getFilterValue('priceVsSma50')?.value as string) || null}
              onChange={(v) => setSingleSelectFilter('priceVsSma50', v)}
            />
            <SingleSelectFilter
              label="Price vs SMA 200"
              options={['Above', 'Below']}
              selected={(getFilterValue('priceVsSma200')?.value as string) || null}
              onChange={(v) => setSingleSelectFilter('priceVsSma200', v)}
            />
            <SingleSelectFilter
              label="Bollinger Position"
              options={['Above Upper', 'Within Bands', 'Below Lower']}
              selected={(getFilterValue('bollingerPosition')?.value as string) || null}
              onChange={(v) => setSingleSelectFilter('bollingerPosition', v)}
            />
            <SingleSelectFilter
              label="Volume vs 20D Avg"
              options={['Below', 'Above', '2x Above', '3x Above']}
              selected={(getFilterValue('volumeVsAvg')?.value as string) || null}
              onChange={(v) => setSingleSelectFilter('volumeVsAvg', v)}
            />
          </FilterGroup>

          <FilterGroup title="Custom">
            <BooleanFilter
              label="Watchlist Only"
              value={(getFilterValue('watchlistOnly')?.value as boolean) || false}
              onChange={(v) => setBooleanFilter('watchlistOnly', v)}
            />
            <BooleanFilter
              label="Recently Updated"
              value={(getFilterValue('recentlyUpdated')?.value as boolean) || false}
              onChange={(v) => setBooleanFilter('recentlyUpdated', v)}
            />
          </FilterGroup>
        </div>
      </SimpleBar>
    </div>
  );
}
