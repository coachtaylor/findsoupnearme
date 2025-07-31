// src/components/ui/SkeletonLoader.js
export default function SkeletonLoader({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array(count).fill(0).map((_, index) => (
        <div key={index} className="border rounded-lg overflow-hidden shadow-md animate-pulse">
          <div className="bg-gray-300 h-48 w-full"></div>
          <div className="p-4">
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-1"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4 mb-3"></div>
            <div className="flex items-center space-x-1 mb-2">
              <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
              <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
              <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
              <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
              <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
            </div>
            <div className="h-10 bg-gray-300 rounded w-full mt-4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}