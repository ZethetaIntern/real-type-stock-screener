# Task 13: Error Boundaries

**Files:**
- Create: `frontend/src/components/ErrorBoundary.tsx`
- Modify: `frontend/src/app/page.tsx` (wrap feature areas)

**Interfaces:**
- Produces: ErrorBoundary component with fallback UI, wraps DataGrid, FilterPanel, Chart independently

## ErrorBoundary Component

```tsx
'use client';
import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`ErrorBoundary [${this.props.name}]:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-900 rounded-lg border border-gray-800">
          <AlertTriangle className="text-warning mb-4" size={48} />
          <h3 className="text-lg font-semibold text-white mb-2">
            Something went wrong in {this.props.name}
          </h3>
          <p className="text-sm text-gray-400 mb-4 text-center max-w-md">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Wrap Feature Areas in page.tsx

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

// In the layout:
<ErrorBoundary name="Filter Panel">
  <FilterPanel />
</ErrorBoundary>

<ErrorBoundary name="Data Grid">
  <DataGrid stocks={stocks} onRowClick={(stock) => setSelectedSymbol(stock.symbol)} />
</ErrorBoundary>

<ErrorBoundary name="Stock Chart">
  <StockChart symbol={selectedSymbol} />
</ErrorBoundary>
```

## Step: Commit

```bash
git add src/components/ErrorBoundary.tsx src/app/page.tsx
git commit -m "feat(ui): add error boundaries for DataGrid, FilterPanel, Chart"
```
