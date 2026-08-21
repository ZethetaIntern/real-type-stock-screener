import { Stock, FilterConfig, FilterOperator, FilterValue, SortConfig } from '@/types/stock';

type Predicate = (stock: Stock) => boolean;

function createPredicate(field: keyof Stock, operator: FilterOperator, value: FilterValue): Predicate {
  return (stock: Stock) => {
    const stockValue = stock[field];

    if (stockValue === null || stockValue === undefined) {
      if (operator === 'eq' && value === null) return true;
      return false;
    }

    switch (operator) {
      case 'eq':
        return stockValue === value;
      case 'neq':
        return stockValue !== value;
      case 'gt':
        return typeof stockValue === 'number' && typeof value === 'number' && stockValue > value;
      case 'gte':
        return typeof stockValue === 'number' && typeof value === 'number' && stockValue >= value;
      case 'lt':
        return typeof stockValue === 'number' && typeof value === 'number' && stockValue < value;
      case 'lte':
        return typeof stockValue === 'number' && typeof value === 'number' && stockValue <= value;
      case 'between': {
        if (!Array.isArray(value) || value.length !== 2) return false;
        const [min, max] = value as number[];
        return typeof stockValue === 'number' && stockValue >= min && stockValue <= max;
      }
      case 'in':
        return Array.isArray(value) && (value as (string | number)[]).includes(stockValue as string | number);
      case 'notIn':
        return Array.isArray(value) && !(value as (string | number)[]).includes(stockValue as string | number);
      case 'contains':
        return typeof stockValue === 'string' && typeof value === 'string' && stockValue.toLowerCase().includes(value.toLowerCase());
      default:
        return true;
    }
  };
}

function getSelectivity(filter: FilterConfig): number {
  const numericOperators = ['between', 'gte', 'lte', 'gt', 'lt'];
  if (numericOperators.includes(filter.operator)) return 0;
  if (filter.operator === 'in' || filter.operator === 'notIn') return 1;
  return 2;
}

export function filterStocks(stocks: Stock[], filters: FilterConfig[]): Stock[] {
  const enabledFilters = filters.filter((f) => f.enabled);
  if (enabledFilters.length === 0) return stocks;

  const sorted = [...enabledFilters].sort((a, b) => getSelectivity(a) - getSelectivity(b));

  const predicates = sorted.map((f) => createPredicate(f.field, f.operator, f.value));

  return stocks.filter((stock) => {
    for (const predicate of predicates) {
      if (!predicate(stock)) return false;
    }
    return true;
  });
}

export function sortStocks(stocks: Stock[], config: SortConfig): Stock[] {
  const { column, direction } = config;
  return [...stocks].sort((a, b) => {
    const aVal = a[column];
    const bVal = b[column];

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    let comparison = 0;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      comparison = aVal.localeCompare(bVal);
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      comparison = aVal - bVal;
    }

    return direction === 'asc' ? comparison : -comparison;
  });
}
