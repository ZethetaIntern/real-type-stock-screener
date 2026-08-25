# EquityPulse — Real-Time Indian Equity Screener

A production-grade stock screener application built with Next.js 14, React 18, and TypeScript. Competes with Screener.in, Finviz, and TradingView Screener.

**Live Demo:** [realtimestockscreener.vercel.app](https://realtimestockscreener.vercel.app)

## Features

### Core
- **5,000+ stocks** with realistic Indian market data
- **30+ filters** across Fundamentals, Market Data, Classification, Technical, and Custom
- **Real-time updates** via WebSocket simulation with geometric Brownian motion
- **Interactive charts** with SMA, EMA, Bollinger Bands, RSI, and Volume Profile
- **Virtual scrolling** for smooth performance with large datasets

### Data Grid
- TanStack Table + TanStack Virtual for 5000+ rows
- 16 columns with specialized cell renderers
- Column sorting (ASC → DESC → NONE)
- Column pinning (Symbol column)
- Column resizing
- Watchlist toggle with star icon
- Real-time price flash animations (300ms)
- Keyboard navigation (arrows, Home/End, Page Up/Down)

### Filters
- Range filters with dual-handle sliders
- Multi-select dropdowns with search
- Single-select radio options
- Boolean toggles
- Active filter chips
- Clear all filters
- 4 preset screeners (Value Stocks, Growth Momentum, Large Cap Quality, Technical Breakout)
- Real-time matching stock count

### Chart
- Candlestick chart via Lightweight Charts
- 5 mandatory indicators (SMA, EMA, Bollinger, RSI, Volume Profile)
- Timeframe switching (1D, 1W, 1M, 3M, 1Y, 5Y)
- Crosshair with OHLCV tooltip
- Zoom, pan, reset
- Responsive resizing
- Data table toggle for accessibility

### Performance
- Virtual scrolling (only ~30 DOM nodes)
- Cell-level memoization
- WebSocket batching with requestAnimationFrame
- Filter engine with predicate optimization
- Dynamic imports for chart library
- Lighthouse Performance score: 92

### Accessibility
- WCAG 2.1 AA compliant
- ARIA grid roles (grid, row, columnheader, gridcell)
- Keyboard navigation
- Screen reader announcements
- High contrast support
- Focus management

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | Framework with App Router |
| React | 18.x | UI library |
| TypeScript | 5.x | Static type checking |
| Tailwind CSS | 3.x | Utility-first styling |
| TanStack Table | 9.x | Data grid |
| TanStack Virtual | 3.x | Virtual scrolling |
| Lightweight Charts | 5.x | Financial charting |
| Zustand | 5.x | State management |
| TanStack Query | 5.x | Server state management |
| Vitest | 4.x | Testing framework |
| React Testing Library | 16.x | Component testing |

## Getting Started

### Prerequisites

- Node.js 20 LTS
- npm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/Mahima0824/real-type-stock-screener.git
cd real-type-stock-screener/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
# Optional: WebSocket URL (defaults to ws://localhost:3001)
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Optional: API base URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run test` | Run tests with Vitest |
| `npm run test:coverage` | Run tests with coverage report |

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── api/              # REST API endpoints
│   │   │   ├── stocks/       # Stock data endpoints
│   │   │   ├── filters/      # Filter presets
│   │   │   ├── sectors/      # Sector classification
│   │   │   └── indices/      # Index composition
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Main screener page
│   │   ├── providers.tsx     # React Query provider
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── Chart/            # Stock chart components
│   │   ├── DataGrid/         # Data grid with cells
│   │   ├── FilterPanel/      # Filter components
│   │   ├── Layout/           # Header, sidebar, etc.
│   │   └── ErrorBoundary.tsx # Error handling
│   ├── hooks/                # Custom React hooks
│   │   ├── useStockData.ts
│   │   ├── useFilterEngine.ts
│   │   ├── useWebSocket.ts
│   │   ├── useStockScreener.ts
│   │   └── useKeyboardNav.ts
│   ├── lib/                  # Utility functions
│   │   ├── filterEngine.ts   # Predicate AST filter engine
│   │   ├── indicators.ts     # Technical indicator calculations
│   │   ├── stockData.ts      # Mock data generator
│   │   └── api.ts            # API fetch helpers
│   ├── stores/               # Zustand stores
│   │   └── stockStore.ts
│   ├── types/                # TypeScript types
│   │   └── stock.ts
│   └── __tests__/            # Test files
│       ├── components/
│       ├── filters/
│       └── indicators/
├── public/                   # Static assets
├── ARCHITECTURE.md           # Architecture documentation
├── PERFORMANCE_REPORT.md     # Performance benchmarks
├── ERRATA.md                 # Deliberate errors documentation
└── package.json
```

## Technology Decisions

### Why Next.js 14?
- App Router for file-based routing
- Server Components for reduced client-side JavaScript
- API routes for mock endpoints
- Built-in optimization (images, fonts, scripts)
- Vercel deployment integration

### Why Zustand over Redux?
- No boilerplate required
- TypeScript-first design
- Granular subscriptions via selectors
- Supports Map/Set for live prices
- Middleware support (immer, persist, devtools)

### Why TanStack Query?
- Automatic caching with stale-while-revalidate
- Background refetching
- Request deduplication
- Optimistic updates
- DevTools for debugging

### Why Lightweight Charts?
- Purpose-built for financial data
- Canvas-based rendering (better than SVG for large datasets)
- ~40KB bundle size
- WebSocket-friendly API
- TradingView open-source library

### Why predicate AST for filters?
- Enables selectivity-based reordering
- Short-circuit evaluation for performance
- Composable AND/OR logic
- Sub-200ms execution for 5000+ records

## Trade-offs

### Client-side vs Server-side filtering
**Decision:** Client-side filtering with predicate AST
**Trade-off:** Larger initial payload, but instant filter response
**Rationale:** Sub-200ms filter response requires client-side execution

### Canvas vs SVG for charts
**Decision:** Canvas (Lightweight Charts)
**Trade-off:** Less customizable, but better performance
**Rationale:** 5000+ data points require canvas rendering

### Zustand vs Redux
**Decision:** Zustand with Immer
**Trade-off:** Less ecosystem tooling, but simpler API
**Rationale:** App complexity doesn't justify Redux overhead

### Real-time simulation vs WebSocket server
**Decision:** Client-side simulation with Brownian motion
**Trade-off:** Not truly real-time, but meets spec requirements
**Rationale:** No server infrastructure needed for demo

## Known Limitations

1. **No real market data** — Uses simulated data with realistic correlations
2. **Client-side filtering** — Initial load transfers full 5000+ record dataset
3. **No persistent watchlist** — Watchlist stored in localStorage only
4. **Limited chart indicators** — Only 5 indicators (SMA, EMA, Bollinger, RSI, Volume Profile)
5. **No real WebSocket server** — Price simulation runs client-side
6. **No mobile app** — Responsive web only
7. **No user authentication** — Single-user application
8. **No data export** — CSV/PDF export not implemented

## Future Improvements

1. **Real market data integration** — Connect to NSE/BSE API
2. **WebSocket server** — Standalone Node.js process for true real-time
3. **More indicators** — MACD, Stochastic, ADX, Ichimoku
4. **Heatmap view** — Market overview by sector/market cap
5. **Saved screeners** — Persist custom filter configurations
6. **Export functionality** — CSV, PDF, Excel export
7. **User authentication** — Multi-user support with watchlists
8. **Alerts** — Price and indicator alerts
9. **Portfolio tracking** — Track holdings and P&L
10. **Mobile app** — React Native implementation

## Performance Benchmarks

| Metric | Target | Actual |
|--------|--------|--------|
| LCP | < 2.5s | ~1.8s |
| Filter Response | < 200ms | ~45ms |
| Sort Response | < 150ms | ~30ms |
| Scroll FPS | > 55 FPS | ~58 FPS |
| Memory (5000 rows) | < 150MB | ~120MB |
| WebSocket Latency | < 50ms | ~15ms |
| TTI | < 3.5s | ~2.8s |
| CLS | < 0.1 | ~0.05 |

See [PERFORMANCE_REPORT.md](./PERFORMANCE_REPORT.md) for detailed benchmarks.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## License

This project is private and confidential.

## Acknowledgments

- [Screener.in](https://www.screener.in/) — Indian equity screener reference
- [Finviz](https://finviz.com/) — US equity screener reference
- [TradingView](https://www.tradingview.com/) — Charting library and screener reference
- [Lightweight Charts](https://github.com/nicholasstephan/lightweight-charts) — Financial charting library
