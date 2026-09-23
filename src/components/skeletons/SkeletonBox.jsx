// src/components/skeletons/SkeletonBox.jsx
// Base skeleton primitive used to compose more complex skeletons.
import clsx from 'clsx';

export default function SkeletonBox({ className = '', rounded = 'rounded' }) {
  return (
    <div
      aria-hidden="true"
      className={clsx('skeleton', rounded, className)}
    />
  );
}
