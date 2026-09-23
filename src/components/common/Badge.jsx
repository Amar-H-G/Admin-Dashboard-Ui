// src/components/common/Badge.jsx
import clsx from 'clsx';

const variants = {
  default:  'bg-slate-100 text-slate-700',
  primary:  'bg-blue-50 text-blue-700',
  success:  'bg-emerald-50 text-emerald-700',
  warning:  'bg-amber-50 text-amber-700',
  danger:   'bg-red-50 text-red-700',
};

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
