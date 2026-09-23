// src/components/feedback/EmptyState.jsx
import Button from '../common/Button';

export default function EmptyState({
  title = 'No items found',
  description,
  message,
  actionLabel,
  onAction,
  action,
  children,
  icon,
}) {
  const displayDescription = description || message || 'Try adjusting your search or filters to find what you are looking for.';

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs my-6">
      <div className="w-16 h-16 mb-4 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
        {icon || (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3.75h3m-3 3.75h3m-6-10.5h12a1.5 1.5 0 011.5 1.5v1.5a1.5 1.5 0 01-1.5 1.5H3.75A1.5 1.5 0 012.25 5.25V3.75A1.5 1.5 0 013.75 2.25h6z" />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6">{displayDescription}</p>
      {action || children ? (
        action || children
      ) : actionLabel && onAction ? (
        <Button variant="secondary" onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
