'use client';

import { useMemo, useRef, useCallback } from 'react';
import {
  useLegacyTable as useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type LegacyColumnDef as ColumnDef,
} from '@tanstack/react-table/legacy';
import { flexRender } from '@tanstack/react-table';
import type { SortingState } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Stock } from '@/types/stock';
import { useStockStore } from '@/stores/stockStore';
import clsx from 'clsx';
import { useState } from 'react';
import {
  PriceCell,
  ChangeCell,
  VolumeCell,
  MarketCapCell,
  RSICell,
  WatchlistCell,
} from './cells';

const ROW_HEIGHT = 36;
const OVERSCAN = 10;

interface DataGridProps {
  stocks: Stock[];
  onRowClick?: (stock: Stock) => void;
}

function DataGridComponent({ stocks, onRowClick }: DataGridProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const { selectedSymbol, setSelectedSymbol, watchlist, toggleWatchlist, livePrices } =
    useStockStore();

  const columns = useMemo<ColumnDef<Stock>[]>(
    () => [
      {
        accessorKey: 'symbol',
        header: 'Symbol',
        size: 100,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <WatchlistCell
              symbol={row.original.symbol}
              isWatchlisted={watchlist.has(row.original.symbol)}
              onToggle={() => toggleWatchlist(row.original.symbol)}
            />
            <span className="font-mono font-semibold text-blue-500">
              {row.original.symbol}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'companyName',
        header: 'Company',
        size: 180,
        cell: ({ getValue }) => (
          <span className="truncate block max-w-[180px]">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'lastPrice',
        header: 'LTP',
        size: 100,
        cell: ({ row }) => (
          <PriceCell value={row.original.lastPrice} symbol={row.original.symbol} />
        ),
      },
      {
        accessorKey: 'changePercent',
        header: '% Chg',
        size: 100,
        cell: ({ row }) => (
          <ChangeCell value={row.original.changePercent} symbol={row.original.symbol} />
        ),
      },
      {
        accessorKey: 'volume',
        header: 'Volume',
        size: 100,
        cell: ({ getValue }) => <VolumeCell value={getValue() as number} />,
      },
      {
        accessorKey: 'marketCap',
        header: 'Mkt Cap',
        size: 120,
        cell: ({ getValue }) => <MarketCapCell value={getValue() as number} />,
      },
      {
        accessorKey: 'pe',
        header: 'P/E',
        size: 70,
        cell: ({ getValue }) => {
          const val = getValue() as number | null;
          return (
            <span className="font-mono tabular-nums text-gray-300">
              {val !== null ? val.toFixed(1) : 'N/A'}
            </span>
          );
        },
      },
      {
        accessorKey: 'pb',
        header: 'P/B',
        size: 70,
        cell: ({ getValue }) => (
          <span className="font-mono tabular-nums text-gray-300">
            {(getValue() as number).toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: 'sector',
        header: 'Sector',
        size: 100,
        cell: ({ getValue }) => (
          <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'rsi14',
        header: 'RSI',
        size: 70,
        cell: ({ getValue }) => <RSICell value={getValue() as number} />,
      },
      {
        accessorKey: 'roe',
        header: 'ROE',
        size: 70,
        cell: ({ getValue }) => (
          <span className="font-mono tabular-nums text-gray-300">
            {(getValue() as number).toFixed(1)}%
          </span>
        ),
      },
      {
        accessorKey: 'roce',
        header: 'ROCE',
        size: 70,
        cell: ({ getValue }) => (
          <span className="font-mono tabular-nums text-gray-300">
            {(getValue() as number).toFixed(1)}%
          </span>
        ),
      },
      {
        accessorKey: 'debtToEquity',
        header: 'D/E',
        size: 70,
        cell: ({ getValue }) => (
          <span className="font-mono tabular-nums text-gray-300">
            {(getValue() as number).toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: 'dividendYield',
        header: 'Div Yld',
        size: 80,
        cell: ({ getValue }) => (
          <span className="font-mono tabular-nums text-gray-300">
            {(getValue() as number).toFixed(2)}%
          </span>
        ),
      },
      {
        accessorKey: 'beta',
        header: 'Beta',
        size: 70,
        cell: ({ getValue }) => {
          const val = getValue() as number;
          const color = val > 1 ? 'text-negative' : val < 1 ? 'text-positive' : 'text-gray-300';
          return (
            <span className={clsx('font-mono tabular-nums', color)}>
              {val.toFixed(2)}
            </span>
          );
        },
      },
      {
        accessorKey: 'changeAbsolute',
        header: 'Day Chg',
        size: 90,
        cell: ({ row }) => {
          const livePrice = livePrices.get(row.original.symbol);
          const base = livePrice?.price ?? row.original.lastPrice;
          const prev = row.original.previousClose;
          const change = base - prev;
          const isPositive = change >= 0;
          return (
            <span
              className={clsx(
                'font-mono tabular-nums',
                isPositive ? 'text-positive' : 'text-negative'
              )}
            >
              {isPositive ? '+' : ''}
              {change.toFixed(2)}
            </span>
          );
        },
      },
    ],
    [livePrices, watchlist, toggleWatchlist]
  );

  const table = useReactTable({
    data: stocks,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { rows } = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start ?? 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows[virtualRows.length - 1]?.end ?? 0)
      : 0;

  const handleRowClick = useCallback(
    (stock: Stock) => {
      setSelectedSymbol(stock.symbol);
      onRowClick?.(stock);
    },
    [setSelectedSymbol, onRowClick]
  );

  return (
    <div className="flex flex-col h-full">
      <div
        ref={tableContainerRef}
        className="flex-1 overflow-auto border border-gray-800 rounded-lg"
        role="grid"
        aria-label="Stock Screener Results"
        aria-rowcount={rows.length}
      >
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-gray-900">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors"
                    style={{ width: header.getSize() }}
                    onClick={header.column.getToggleSortingHandler()}
                    role="columnheader"
                    aria-sort={
                      header.column.getIsSorted()
                        ? header.column.getIsSorted() === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && (
                        <span className="text-blue-500">↑</span>
                      )}
                      {header.column.getIsSorted() === 'desc' && (
                        <span className="text-blue-500">↓</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {paddingTop > 0 && (
              <tr>
                <td style={{ height: `${paddingTop}px` }} />
              </tr>
            )}
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];
              const isSelected = row.original.symbol === selectedSymbol;
              return (
                <tr
                  key={row.id}
                  className={clsx(
                    'border-b border-gray-900 cursor-pointer transition-colors',
                    isSelected ? 'bg-blue-900/30' : 'hover:bg-gray-900'
                  )}
                  onClick={() => handleRowClick(row.original)}
                  role="row"
                  aria-rowindex={virtualRow.index + 2}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="py-2 px-4 text-sm"
                      role="gridcell"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
            {paddingBottom > 0 && (
              <tr>
                <td style={{ height: `${paddingBottom}px` }} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataGridComponent;
