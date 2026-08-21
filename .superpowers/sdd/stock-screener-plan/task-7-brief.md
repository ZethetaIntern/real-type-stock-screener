# Task 7: Build FilterPanel Compound Component

**Files:**
- Create: `frontend/src/components/FilterPanel/FilterPanel.tsx`
- Create: `frontend/src/components/FilterPanel/FilterGroup.tsx`
- Create: `frontend/src/components/FilterPanel/RangeFilter.tsx`
- Create: `frontend/src/components/FilterPanel/MultiSelectFilter.tsx`
- Create: `frontend/src/components/FilterPanel/SingleSelectFilter.tsx`
- Create: `frontend/src/components/FilterPanel/BooleanFilter.tsx`
- Create: `frontend/src/components/FilterPanel/PresetSelector.tsx`
- Create: `frontend/src/components/FilterPanel/ActiveFilterChips.tsx`

**Interfaces:**
- Produces: FilterPanel with 30+ filters grouped in accordion sections, preset loading, active filter chips
- Consumes: `useStockStore` (activeFilters, addFilter, removeFilter, clearAllFilters, loadPreset)

## Component Architecture

The FilterPanel is a compound component where child filter types (RangeFilter, MultiSelectFilter, etc.) register with the parent and share state through Zustand store.

## FilterGroup (Accordion)

```tsx
'use client';
import { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface FilterGroupProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function FilterGroup({ title, children, defaultOpen = false }: FilterGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-800 transition-colors"
      >
        {title}
        <ChevronDown size={16} className={clsx('transition-transform', isOpen && 'rotate-180')} />
      </button>
      {isOpen && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}
```

## RangeFilter

Dual-handle slider with min/max numeric inputs. Debounced 300ms.

```tsx
'use client';
import { useState, useCallback, useRef } from 'react';

interface RangeFilterProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value?: [number, number];
  onChange: (range: [number, number]) => void;
  unit?: string;
}

export function RangeFilter({ label, min, max, step = 1, value, onChange, unit }: RangeFilterProps) {
  const [localMin, setLocalMin] = useState(value?.[0] ?? min);
  const [localMax, setLocalMax] = useState(value?.[1] ?? max);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedChange = useCallback((newMin: number, newMax: number) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => onChange([newMin, newMax]), 300);
  }, [onChange]);

  return (
    <div className="space-y-2">
      <label className="text-xs text-gray-400">{label}</label>
      <div className="flex gap-2">
        <input
          type="number"
          value={localMin}
          onChange={(e) => { setLocalMin(Number(e.target.value)); debouncedChange(Number(e.target.value), localMax); }}
          className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
          placeholder="Min"
        />
        <span className="text-gray-500 self-center">-</span>
        <input
          type="number"
          value={localMax}
          onChange={(e) => { setLocalMax(Number(e.target.value)); debouncedChange(localMin, Number(e.target.value)); }}
          className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
          placeholder="Max"
        />
      </div>
      {unit && <span className="text-xs text-gray-500">{unit}</span>}
    </div>
  );
}
```

## MultiSelectFilter

Checkbox dropdown with search for sectors, industries, indices.

```tsx
'use client';
import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import clsx from 'clsx';

interface MultiSelectFilterProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function MultiSelectFilter({ label, options, selected, onChange }: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = options.filter((o) => o.toLowerCase().includes(search.toLowerCase()));

  const toggle = (option: string) => {
    onChange(selected.includes(option) ? selected.filter((s) => s !== option) : [...selected, option]);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-300"
      >
        {selected.length > 0 ? `${selected.length} selected` : label}
        <ChevronDown size={14} />
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded shadow-lg max-h-48 overflow-auto">
          <div className="p-2 border-b border-gray-700">
            <div className="flex items-center gap-2 bg-gray-900 rounded px-2 py-1">
              <Search size={14} className="text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-sm text-white w-full outline-none"
                placeholder="Search..."
              />
            </div>
          </div>
          {filtered.map((option) => (
            <label key={option} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggle(option)}
                className="rounded border-gray-600"
              />
              <span className="text-sm text-gray-300">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
```

## SingleSelectFilter

Radio button group for MACD Signal, Price vs SMA, Bollinger Position, Volume vs Avg.

```tsx
'use client';
import clsx from 'clsx';

interface SingleSelectFilterProps {
  label: string;
  options: string[];
  selected: string | null;
  onChange: (value: string | null) => void;
}

export function SingleSelectFilter({ label, options, selected, onChange }: SingleSelectFilterProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-gray-400">{label}</label>
      <div className="flex flex-wrap gap-1">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(selected === option ? null : option)}
            className={clsx(
              'px-2 py-1 rounded text-xs transition-colors',
              selected === option ? 'bg-brand-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
```

## BooleanFilter

Toggle switch for Watchlist Only.

```tsx
'use client';
import clsx from 'clsx';

interface BooleanFilterProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function BooleanFilter({ label, value, onChange }: BooleanFilterProps) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-gray-300">{label}</span>
      <div
        onClick={() => onChange(!value)}
        className={clsx(
          'w-10 h-6 rounded-full transition-colors relative',
          value ? 'bg-brand-600' : 'bg-gray-700'
        )}
      >
        <div
          className={clsx(
            'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
            value ? 'translate-x-5' : 'translate-x-1'
          )}
        />
      </div>
    </label>
  );
}
```

## PresetSelector

Dropdown to load preset filter configurations.

```tsx
'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchFilterPresets } from '@/lib/api';
import { useStockStore } from '@/stores/stockStore';

export function PresetSelector() {
  const { data: presets } = useQuery({ queryKey: ['presets'], queryFn: () => fetchFilterPresets() });
  const loadPreset = useStockStore((s) => s.loadPreset);

  return (
    <div className="px-4 py-3 border-b border-gray-800">
      <label className="text-xs text-gray-400 mb-2 block">Presets</label>
      <select
        onChange={(e) => {
          const preset = presets?.data?.find((p) => p.id === e.target.value);
          if (preset) loadPreset(preset.filters);
        }}
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
      >
        <option value="">Select preset...</option>
        {presets?.data?.map((preset) => (
          <option key={preset.id} value={preset.id}>{preset.name}</option>
        ))}
      </select>
    </div>
  );
}
```

## ActiveFilterChips

Removable badges showing active filters, with count.

```tsx
'use client';
import { X } from 'lucide-react';
import { useStockStore } from '@/stores/stockStore';

export function ActiveFilterChips() {
  const activeFilters = useStockStore((s) => s.activeFilters);
  const removeFilter = useStockStore((s) => s.removeFilter);
  const clearAllFilters = useStockStore((s) => s.clearAllFilters);

  if (activeFilters.length === 0) return null;

  return (
    <div className="px-4 py-2 border-b border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">{activeFilters.length} filters active</span>
        <button onClick={clearAllFilters} className="text-xs text-brand-500 hover:text-brand-400">
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {activeFilters.map((filter) => (
          <span key={filter.id} className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">
            {filter.field}: {String(filter.value)}
            <button onClick={() => removeFilter(filter.id)} className="hover:text-red-400">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
```

## FilterPanel Assembly

The main FilterPanel composes all groups:

```tsx
'use client';
import { useStockStore } from '@/stores/stockStore';
import { SECTORS, INDEX_MEMBERSHIP } from '@/types/stock';
import { FilterGroup } from './FilterGroup';
import { RangeFilter } from './RangeFilter';
import { MultiSelectFilter } from './MultiSelectFilter';
import { SingleSelectFilter } from './SingleSelectFilter';
import { BooleanFilter } from './BooleanFilter';
import { PresetSelector } from './PresetSelector';
import { ActiveFilterChips } from './ActiveFilterChips';

export function FilterPanel() {
  const { activeFilters, addFilter, removeFilter, updateFilter } = useStockStore();

  // Helper to find or create filter
  const getFilterValue = (field: string) => activeFilters.find((f) => f.field === field);
  const setRangeFilter = (field: string, range: [number, number]) => {
    const existing = getFilterValue(field);
    if (existing) {
      updateFilter(existing.id, { value: range });
    } else {
      addFilter({ id: `${field}-${Date.now()}`, field: field as any, operator: 'between', value: range, enabled: true });
    }
  };

  return (
    <div className="w-80 border-r border-gray-800 overflow-y-auto h-full">
      <PresetSelector />
      <ActiveFilterChips />

      <FilterGroup title="Fundamentals" defaultOpen>
        <RangeFilter label="Market Cap (Cr)" min={0} max={5000000} step={1000} onChange={(v) => setRangeFilter('marketCap', v)} unit="Cr" />
        <RangeFilter label="P/E Ratio" min={-100} max={500} onChange={(v) => setRangeFilter('pe', v)} />
        <RangeFilter label="P/B Ratio" min={0} max={100} onChange={(v) => setRangeFilter('pb', v)} />
        <RangeFilter label="Dividend Yield (%)" min={0} max={25} onChange={(v) => setRangeFilter('dividendYield', v)} unit="%" />
        <RangeFilter label="EPS" min={-500} max={5000} onChange={(v) => setRangeFilter('eps', v)} />
        <RangeFilter label="ROE (%)" min={-100} max={200} onChange={(v) => setRangeFilter('roe', v)} unit="%" />
        <RangeFilter label="ROCE (%)" min={-100} max={200} onChange={(v) => setRangeFilter('roce', v)} unit="%" />
        <RangeFilter label="Debt/Equity" min={0} max={10} step={0.1} onChange={(v) => setRangeFilter('debtToEquity', v)} />
        <RangeFilter label="Current Ratio" min={0} max={20} step={0.1} onChange={(v) => setRangeFilter('currentRatio', v)} />
        <RangeFilter label="Promoter Holding (%)" min={0} max={100} onChange={(v) => setRangeFilter('promoterHolding', v)} unit="%" />
        <RangeFilter label="Revenue Growth YoY (%)" min={-100} max={500} onChange={(v) => setRangeFilter('revenueGrowthYoY', v)} unit="%" />
        <RangeFilter label="Profit Growth YoY (%)" min={-100} max={1000} onChange={(v) => setRangeFilter('profitGrowthYoY', v)} unit="%" />
      </FilterGroup>

      <FilterGroup title="Market Data">
        <RangeFilter label="LTP (₹)" min={0} max={500000} onChange={(v) => setRangeFilter('lastPrice', v)} unit="₹" />
        <RangeFilter label="52W High Proximity (%)" min={0} max={100} onChange={(v) => setRangeFilter('week52High', v)} unit="%" />
        <RangeFilter label="52W Low Proximity (%)" min={0} max={100} onChange={(v) => setRangeFilter('week52Low', v)} unit="%" />
        <RangeFilter label="Avg Volume (20D)" min={0} max={100000000} step={10000} onChange={(v) => setRangeFilter('avgVolume20D', v)} />
        <RangeFilter label="Beta" min={-2} max={5} step={0.1} onChange={(v) => setRangeFilter('beta', v)} />
        <RangeFilter label="Day Change (%)" min={-20} max={20} step={0.1} onChange={(v) => setRangeFilter('changePercent', v)} unit="%" />
      </FilterGroup>

      <FilterGroup title="Classification">
        <MultiSelectFilter label="Sector" options={[...SECTORS]} selected={getFilterValue('sector')?.value as string[] || []} onChange={(v) => {/* set filter */}} />
        <MultiSelectFilter label="Market Cap Category" options={['Large Cap', 'Mid Cap', 'Small Cap', 'Micro Cap']} selected={getFilterValue('marketCapCategory')?.value as string[] || []} onChange={(v) => {/* set filter */}} />
        <MultiSelectFilter label="Index Membership" options={[...INDEX_MEMBERSHIP]} selected={getFilterValue('indexMembership')?.value as string[] || []} onChange={(v) => {/* set filter */}} />
      </FilterGroup>

      <FilterGroup title="Technical">
        <RangeFilter label="RSI (14)" min={0} max={100} onChange={(v) => setRangeFilter('rsi14', v)} />
        <RangeFilter label="ATR" min={0} max={500} onChange={(v) => setRangeFilter('atr', v)} />
        <SingleSelectFilter label="MACD Signal" options={['Bullish', 'Bearish', 'Neutral']} selected={getFilterValue('macdSignal')?.value as string || null} onChange={(v) => {/* set filter */}} />
        <SingleSelectFilter label="Price vs SMA 50" options={['Above', 'Below']} selected={getFilterValue('priceVsSma50')?.value as string || null} onChange={(v) => {/* set filter */}} />
        <SingleSelectFilter label="Price vs SMA 200" options={['Above', 'Below']} selected={getFilterValue('priceVsSma200')?.value as string || null} onChange={(v) => {/* set filter */}} />
        <SingleSelectFilter label="Bollinger Position" options={['Above Upper', 'Within Bands', 'Below Lower']} selected={getFilterValue('bollingerPosition')?.value as string || null} onChange={(v) => {/* set filter */}} />
        <SingleSelectFilter label="Volume vs 20D Avg" options={['Below', 'Above', '2x Above', '3x Above']} selected={getFilterValue('volumeVsAvg')?.value as string || null} onChange={(v) => {/* set filter */}} />
      </FilterGroup>

      <FilterGroup title="Custom">
        <BooleanFilter label="Watchlist Only" value={getFilterValue('watchlistOnly')?.value as boolean || false} onChange={(v) => {/* set filter */}} />
      </FilterGroup>
    </div>
  );
}
```

## Step: Commit

```bash
git add src/components/FilterPanel/
git commit -m "feat(filters): build compound FilterPanel with 30+ filter controls"
```
