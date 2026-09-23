// src/components/products/Pagination.jsx
import clsx from 'clsx';
import Button from '../common/Button';
import Select from '../common/Select';
import { PAGE_SIZE_OPTIONS } from '../../constants';

export default function Pagination({ page, limit, total, onPageChange, onLimitChange }) {
  const totalPages  = Math.max(1, Math.ceil(total / limit));
  const validPage   = Math.min(Math.max(1, page), totalPages);
  const start       = total === 0 ? 0 : Math.min((validPage - 1) * limit + 1, total);
  const end         = Math.min(validPage * limit, total);

  const isFirst = page <= 1;
  const isLast  = page >= totalPages;

  // Build visible page numbers with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set([1, 2, page - 1, page, page + 1, totalPages - 1, totalPages]);
    return [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  };

  const pageNumbers = getPageNumbers();

  const pageSizeOptions = PAGE_SIZE_OPTIONS.map((v) => ({ value: String(v), label: `${v} / page` }));

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border-t border-slate-100 rounded-b-2xl">
      {/* Showing X–Y of Z */}
      <p className="text-sm text-slate-500 shrink-0">
        {total === 0 ? 'No results' : (
          <>Showing <span className="font-semibold text-slate-700">{start}</span>–<span className="font-semibold text-slate-700">{end}</span> of <span className="font-semibold text-slate-700">{total}</span> products</>
        )}
      </p>

      <div className="flex items-center gap-3 flex-wrap justify-center">
        {/* Page size selector */}
        <Select
          id="page-size"
          aria-label="Items per page"
          options={pageSizeOptions}
          value={String(limit)}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="w-28 py-1.5 text-xs"
        />

        {/* Previous */}
        <Button
          variant="secondary"
          size="xs"
          disabled={isFirst}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
          leftIcon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          }
        >
          Prev
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1" role="navigation" aria-label="Pagination">
          {pageNumbers.map((num, idx) => {
            const prev = pageNumbers[idx - 1];
            const showEllipsis = prev && num - prev > 1;
            return (
              <span key={num} className="flex items-center gap-1">
                {showEllipsis && (
                  <span className="px-1 text-slate-400 text-xs select-none" aria-hidden="true">…</span>
                )}
                <button
                  onClick={() => onPageChange(num)}
                  aria-label={`Page ${num}`}
                  aria-current={num === page ? 'page' : undefined}
                  className={clsx(
                    'w-7 h-7 rounded-lg text-xs font-medium transition-all duration-100',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                    num === page
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  {num}
                </button>
              </span>
            );
          })}
        </div>

        {/* Next */}
        <Button
          variant="secondary"
          size="xs"
          disabled={isLast}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
          rightIcon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          }
        >
          Next
        </Button>
      </div>
    </div>
  );
}
