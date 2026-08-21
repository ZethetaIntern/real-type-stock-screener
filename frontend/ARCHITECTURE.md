# Architecture

## Component Structure

```
src/
├── app/
│   ├── layout.tsx    # Root layout with metadata
│   ├── page.tsx     # Main screener page
│   └── globals.css  # Tailwind imports + CSS variables
├── components/
│   ├── StockTable.tsx   # Data table with stock listings
│   └── FilterPanel.tsx # Sidebar filters
├── lib/
│   └── stockData.ts    # Mock data + filter logic
└── types/
    └── stock.ts        # TypeScript interfaces
```

## State Management

- React useState + useEffect for local state
- Filter state lifted to page level, passed to components via props
- No external state library needed for this scope

## Data Flow

1. Mock stock data imported from `lib/stockData.ts`
2. Filters applied via `filterStocks()` function
3. Filtered results passed to `StockTable` component
4. Real-time updates simulated via state refresh

## Design Decisions

- Dark theme (default) with CSS variables for theming
- CSS-in-Tailwind approach (no external CSS framework)
- Lucide icons for consistent iconography
- Table layout for scannable data display