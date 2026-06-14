import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => (
  <div className="relative w-full">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="input-field pl-10"
    />
  </div>
);

export const Pagination = ({ page, pages, total, onPageChange }) => {
  if (pages <= 1) return null;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4 pt-4 border-t border-secondary-100 dark:border-secondary-700">
      <p className="text-sm text-secondary-500 text-center sm:text-left">
        Page {page} of {pages} ({total} total)
      </p>
      <div className="flex gap-2 justify-center sm:justify-end">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="btn-secondary p-2 disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="btn-secondary p-2 disabled:opacity-50"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4 sm:mb-6">
    <div className="min-w-0">
      <h1 className="text-xl sm:text-2xl font-bold text-secondary-800 dark:text-secondary-100">{title}</h1>
      {subtitle && <p className="text-secondary-500 dark:text-secondary-400 mt-1 text-sm sm:text-base">{subtitle}</p>}
    </div>
    {action && <div className="flex flex-wrap gap-2 w-full sm:w-auto shrink-0">{action}</div>}
  </div>
);

export const FilterBar = ({ children }) => (
  <div className="card mb-4 sm:mb-6">
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:flex-nowrap sm:items-center sm:gap-3">
      {children}
    </div>
  </div>
);

export const TableWrapper = ({ children }) => (
  <div className="table-wrapper">
    {children}
  </div>
);
