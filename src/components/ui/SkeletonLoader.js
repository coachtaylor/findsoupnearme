// src/components/ui/SkeletonLoader.js
export default function SkeletonLoader({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
      {Array(count).fill(0).map((_, index) => (
        <div 
          key={index} 
          className="glassmorphism-card h-full shimmer-card stagger-animate"
          style={{
            animationDelay: `${index * 150}ms`,
            transform: `translateY(${index * 20}px)`
          }}
        >
          {/* Image skeleton */}
          <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
            <div className="w-full h-full bg-gradient-to-br from-neutral-200 via-neutral-300 to-neutral-200 shimmer-animation"></div>
            
            {/* Price badge skeleton */}
            <div className="absolute top-3 right-3 h-6 w-12 bg-white/80 backdrop-blur-sm rounded-full shimmer-animation"></div>
            
            {/* Verified badge skeleton */}
            <div className="absolute top-3 left-3 h-6 w-16 bg-white/90 rounded-full shimmer-animation"></div>
          </div>
          
          <div className="p-6 relative z-10 flex flex-col flex-1">
            <div className="flex-1 space-y-4">
              {/* Restaurant name skeleton */}
              <div className="h-6 bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 rounded-full w-3/4 shimmer-animation"></div>
              
              {/* Star rating skeleton */}
              <div className="flex items-center">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 w-4 bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 rounded-full shimmer-animation mr-1"></div>
                  ))}
                </div>
                <div className="h-4 w-16 bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 rounded-full shimmer-animation"></div>
              </div>
              
              {/* Location skeleton */}
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 rounded-full shimmer-animation"></div>
                <div className="h-4 w-24 bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 rounded-full shimmer-animation"></div>
              </div>
              
              {/* Soup types skeleton */}
              <div className="flex flex-wrap gap-2 min-h-[3rem]">
                <div className="h-6 w-16 bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 rounded-full shimmer-animation"></div>
                <div className="h-6 w-20 bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 rounded-full shimmer-animation"></div>
                <div className="h-6 w-14 bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 rounded-full shimmer-animation"></div>
              </div>
            </div>
            
            {/* Button skeleton */}
            <div className="h-12 bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 rounded-xl w-full mt-6 shimmer-animation"></div>
          </div>
          
          {/* Subtle border glow effect skeleton */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-neutral-200/30 via-transparent to-neutral-300/30 rounded-xl opacity-50 pointer-events-none blur-sm"></div>
        </div>
      ))}
    </div>
  );
}