// src/components/skeletons/ProductDetailsSkeleton.jsx
import SkeletonBox from './SkeletonBox';

export default function ProductDetailsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading product details…" className="max-w-6xl mx-auto px-4 py-8">
      {/* Back button */}
      <SkeletonBox className="h-8 w-28 mb-6" rounded="rounded-lg" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image gallery */}
        <div className="flex flex-col gap-3">
          <SkeletonBox className="w-full aspect-square" rounded="rounded-2xl" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBox key={i} className="w-16 h-16" rounded="rounded-xl" />
            ))}
          </div>
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-4">
          <SkeletonBox className="h-5 w-24" rounded="rounded-full" />
          <SkeletonBox className="h-8 w-5/6" rounded="rounded-lg" />
          <SkeletonBox className="h-4 w-1/3" rounded="rounded-md" />
          <div className="flex flex-col gap-2 mt-2">
            <SkeletonBox className="h-3.5 w-full" rounded="rounded-md" />
            <SkeletonBox className="h-3.5 w-full" rounded="rounded-md" />
            <SkeletonBox className="h-3.5 w-3/4" rounded="rounded-md" />
          </div>
          <SkeletonBox className="h-10 w-32 mt-2" rounded="rounded-xl" />
          <div className="grid grid-cols-2 gap-4 mt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                <SkeletonBox className="h-3 w-16" rounded="rounded-md" />
                <SkeletonBox className="h-5 w-24" rounded="rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12">
        <SkeletonBox className="h-6 w-32 mb-6" rounded="rounded-lg" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <SkeletonBox className="w-9 h-9" rounded="rounded-full" />
                <div className="flex flex-col gap-1.5">
                  <SkeletonBox className="h-3.5 w-32" rounded="rounded-md" />
                  <SkeletonBox className="h-3 w-20" rounded="rounded-md" />
                </div>
              </div>
              <SkeletonBox className="h-3.5 w-full" rounded="rounded-md" />
              <SkeletonBox className="h-3.5 w-4/5" rounded="rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
