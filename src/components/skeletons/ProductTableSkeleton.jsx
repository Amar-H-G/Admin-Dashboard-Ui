// src/components/skeletons/ProductTableSkeleton.jsx
import SkeletonBox from './SkeletonBox';

export default function ProductTableSkeleton({ rows = 10 }) {
  return (
    <div aria-busy="true" aria-label="Loading products…">
      {/* Table header skeleton */}
      <div className="hidden md:grid grid-cols-[56px_1fr_140px_90px_90px_80px_110px] gap-4 px-4 py-3 border-b border-slate-100">
        {['', 'Product', 'Category', 'Price', 'Rating', 'Stock', 'Actions'].map((col, i) => (
          <SkeletonBox key={i} className={`h-3.5 ${i === 0 ? 'w-8' : 'w-3/4'}`} rounded="rounded-md" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[56px_1fr_140px_90px_90px_80px_110px] gap-4 items-center px-4 py-3.5 border-b border-slate-50 hidden md:grid"
        >
          <SkeletonBox className="w-10 h-10" rounded="rounded-lg" />
          <div className="flex flex-col gap-1.5">
            <SkeletonBox className="h-3.5 w-5/6" rounded="rounded-md" />
            <SkeletonBox className="h-3 w-2/5" rounded="rounded-md" />
          </div>
          <SkeletonBox className="h-5 w-24" rounded="rounded-full" />
          <SkeletonBox className="h-3.5 w-14" rounded="rounded-md" />
          <SkeletonBox className="h-3.5 w-10" rounded="rounded-md" />
          <SkeletonBox className="h-5 w-16" rounded="rounded-md" />
          <div className="flex gap-2">
            <SkeletonBox className="h-7 w-7" rounded="rounded-lg" />
            <SkeletonBox className="h-7 w-7" rounded="rounded-lg" />
            <SkeletonBox className="h-7 w-7" rounded="rounded-lg" />
          </div>
        </div>
      ))}

      {/* Mobile cards skeleton */}
      <div className="md:hidden flex flex-col gap-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 flex gap-3">
            <SkeletonBox className="w-16 h-16 flex-shrink-0" rounded="rounded-xl" />
            <div className="flex-1 flex flex-col gap-2">
              <SkeletonBox className="h-4 w-4/5" rounded="rounded-md" />
              <SkeletonBox className="h-3 w-2/5" rounded="rounded-full" />
              <div className="flex items-center gap-3 mt-1">
                <SkeletonBox className="h-3.5 w-16" rounded="rounded-md" />
                <SkeletonBox className="h-3.5 w-12" rounded="rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
