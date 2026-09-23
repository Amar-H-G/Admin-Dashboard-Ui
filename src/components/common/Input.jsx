// src/components/common/Input.jsx
import clsx from 'clsx';

export default function Input({
  label,
  id,
  error,
  helperText,
  leftIcon,
  rightElement,
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
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-slate-400 pointer-events-none flex items-center" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <input
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          className={clsx(
            'w-full rounded-lg border bg-white text-slate-900 text-sm placeholder-slate-400',
            'transition-colors duration-150 ease-in-out',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            leftIcon  ? 'pl-9' : 'pl-3.5',
            rightElement ? 'pr-10' : 'pr-3.5',
            'py-2.5',
            error
              ? 'border-red-400 bg-red-50/30 focus:ring-red-400'
              : 'border-slate-200 hover:border-slate-300',
            className
          )}
          {...props}
        />
        {rightElement && (
          <span className="absolute right-2 flex items-center">
            {rightElement}
          </span>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${id}-helper`} className="text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
}
