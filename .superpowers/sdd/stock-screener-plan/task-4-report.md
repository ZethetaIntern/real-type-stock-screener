# Task 4 Report: Rework Filter Engine with Predicate AST

**Status:** COMPLETE

**Commit:** `5a41072 feat(filters): rewrite filter engine with predicate AST and short-circuit evaluation`

## What Changed

### `frontend/src/lib/filterEngine.ts` — Full Rewrite
- **Old:** `filterStocks(stocks, FilterCriteria)` — flat if-else chain with 40+ individual filter checks
- **New:** `filterStocks(stocks, FilterConfig[])` — predicate AST with factory pattern

Key design decisions:
- `createPredicate(field, operator, value)` returns a closure — one per filter config
- `getSelectivity()` orders predicates: numeric ranges (0) → multi-select (1) → equality (2)
- Short-circuit AND: `for` loop exits on first `false` predicate
- Null/undefined stock values always fail (except `eq null`)

### `frontend/src/__tests__/filters/filterEngine.test.ts` — Created
- 11 tests covering: empty filters, gte, between, in, disabled, AND logic, null handling, performance (5000 stocks < 200ms), and sort (asc/desc/numeric/string)

### `frontend/vitest.config.ts` — Created
- Minimal vitest config with `@/` path alias resolution

## Breaking Change

`useStockScreener.ts:12` still passes `FilterCriteria` (flat object) to `filterStocks`. This will break at runtime. A later task must update the store/hook to produce `FilterConfig[]` instead.

## Test Results

```
Tests: 11 passed, 11 total
Duration: 522ms
```
