// src/components/ui/SkeletonLoader.js
export default function SkeletonLoader({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array(count).fill(0).map((_, index) => (
        <div key={index} className="border rounded-2xl overflow-hidden shadow-soft animate-pulse bg-white">
          <div className="bg-neutral-200 h-48 w-full"></div>
          <div className="p-5">
            <div className="h-6 bg-neutral-200 rounded-full w-3/4 mb-3"></div>
            <div className="h-4 bg-neutral-200 rounded-full w-1/2 mb-2"></div>
            
            {/* Rating skeleton */}
            <div className="flex items-center space-x-1 mb-3 mt-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 w-4 bg-neutral-200 rounded-full"></div>
              ))}
              <div className="h-4 w-16 bg-neutral-200 rounded-full ml-2"></div>
            </div>
            
            {/* Tags skeleton */}
            <div className="flex flex-wrap gap-1 mb-4">
              <div className="h-6 w-16 bg-neutral-200 rounded-full"></div>
              <div className="h-6 w-20 bg-neutral-200 rounded-full"></div>
              <div className="h-6 w-14 bg-neutral-200 rounded-full"></div>
            </div>
            
            {/* Button skeleton */}
            <div className="h-12 bg-neutral-200 rounded-xl w-full mt-4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}