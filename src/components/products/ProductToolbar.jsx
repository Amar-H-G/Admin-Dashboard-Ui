import { useState, useEffect, useRef } from 'react';
import Select from '../common/Select';
import Button from '../common/Button';
import { SORT_FIELD_OPTIONS } from '../../constants';
import { slugToLabel } from '../../utils/formatters';

export default function ProductToolbar({
  search,
  category,
  sortBy,
  sortOrder,
  categories = [],
  viewMode,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onViewModeChange,
  onResetFilters,
}) {
  const [searchInput, setSearchInput] = useState(search || '');
  const debounceTimerRef = useRef(null);

  // Sync internal search input when URL search changes externally (e.g. Back/Forward, Reset)
  useEffect(() => {
    setSearchInput(search || '');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, [search]);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSearchInputChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      onSearchChange(val.trim());
    }, 400);
  };

  const handleClearSearch = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setSearchInput('');
    onSearchChange('');
  };

  const handleClearAll = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setSearchInput('');
    if (onResetFilters) {
      onResetFilters();
    }
  };

  // Format category options safely for strings or objects
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map((cat) => {
      if (typeof cat === 'object' && cat !== null) {
        return { value: cat.slug, label: cat.name || slugToLabel(cat.slug) };
      }
      return { value: String(cat), label: slugToLabel(String(cat)) };
    }),
  ];

  const hasActiveFilters = Boolean(search || category || sortBy);

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1 min-w-[260px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search products by title or description..."
            value={searchInput}
            onChange={handleSearchInputChange}
            className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Dropdown */}
          <div className="w-44">
            <Select
              id="category-filter"
              aria-label="Filter by category"
              options={categoryOptions}
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="py-2 text-sm bg-slate-50"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="w-36">
            <Select
              id="sort-filter"
              aria-label="Sort by field"
              options={SORT_FIELD_OPTIONS}
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value, sortOrder)}
              className="py-2 text-sm bg-slate-50"
            />
          </div>

          {/* Sort Order Toggle */}
          {sortBy && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
              title={sortOrder === 'asc' ? 'Ascending (click for descending)' : 'Descending (click for ascending)'}
              aria-label="Toggle sort direction"
              className="px-2.5 py-2"
            >
              {sortOrder === 'asc' ? (
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
              )}
            </Button>
          )}

          {/* View Toggle (Grid / Table) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table view"
              aria-label="Table view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid view"
              aria-label="Grid view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Active filters pill bar */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap text-xs">
          <span className="text-slate-400 font-medium">Active Filters:</span>
          {search && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-100">
              Query: &ldquo;{search}&rdquo;
              <button
                type="button"
                onClick={handleClearSearch}
                className="hover:text-blue-900 cursor-pointer"
                aria-label="Remove search filter"
              >
                ×
              </button>
            </span>
          )}
          {category && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
              Category: {slugToLabel(category)}
              <button
                type="button"
                onClick={() => onCategoryChange('')}
                className="hover:text-indigo-900 cursor-pointer"
              >
                ×
              </button>
            </span>
          )}
          {sortBy && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
              Sorted: {sortBy} ({sortOrder})
              <button
                type="button"
                onClick={() => onSortChange('', 'asc')}
                className="hover:text-slate-900 cursor-pointer"
              >
                ×
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={handleClearAll}
            className="text-slate-500 hover:text-red-600 font-medium underline ml-auto cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
