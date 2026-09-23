// src/components/skeletons/FormSkeleton.jsx
import SkeletonBox from './SkeletonBox';

export default function FormSkeleton({ fields = 5 }) {
  return (
    <div aria-busy="true" aria-label="Loading form…" className="flex flex-col gap-5">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <SkeletonBox className="h-3.5 w-24" rounded="rounded-md" />
          <SkeletonBox className="h-10 w-full" rounded="rounded-lg" />
        </div>
      ))}
      <div className="flex gap-3 mt-2">
        <SkeletonBox className="h-10 w-28" rounded="rounded-lg" />
        <SkeletonBox className="h-10 w-20" rounded="rounded-lg" />
      </div>
    </div>
  );
}
