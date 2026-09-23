// src/components/common/Textarea.jsx
import clsx from 'clsx';

export default function Textarea({
  label,
  id,
  error,
  helperText,
  rows = 4,
  className = '',
  wrapperClassName = '',
  ...props
}) {
  return (
    <div className={clsx('flex flex-col gap-1.5', wrapperClassName)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={clsx(
          'w-full rounded-lg border bg-white text-slate-900 text-sm placeholder-slate-400',
          'px-3.5 py-2.5 resize-vertical',
          'transition-colors duration-150 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          error
            ? 'border-red-400 bg-red-50/30 focus:ring-red-400'
            : 'border-slate-200 hover:border-slate-300',
          className
        )}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600">{error}</p>
      )}
      {!error && helperText && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
}
