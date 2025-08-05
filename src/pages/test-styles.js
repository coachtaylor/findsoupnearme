export default function TestStyles() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary-500 mb-8">Tailwind CSS Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Tailwind Classes */}
          <div className="bg-white p-6 rounded-2xl shadow-soft">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Basic Classes</h2>
            <div className="space-y-4">
              <div className="bg-primary-500 text-white p-4 rounded-xl">Primary Color</div>
              <div className="bg-secondary-500 text-white p-4 rounded-xl">Secondary Color</div>
              <div className="bg-accent-500 text-white p-4 rounded-xl">Accent Color</div>
              <div className="bg-neutral-100 text-neutral-900 p-4 rounded-xl">Neutral Color</div>
            </div>
          </div>
          
          {/* Custom Classes */}
          <div className="bg-white p-6 rounded-2xl shadow-soft">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Custom Classes</h2>
            <div className="space-y-4">
              <div className="btn btn-primary">Primary Button</div>
              <div className="btn btn-secondary">Secondary Button</div>
              <div className="card p-4">Card Component</div>
              <div className="badge bg-primary-100 text-primary-800">Badge</div>
            </div>
          </div>
        </div>
        
        {/* Font Test */}
        <div className="bg-white p-6 rounded-2xl shadow-soft mt-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Font Test</h2>
          <p className="font-sans text-lg">Sans Font (Inter)</p>
          <p className="font-serif text-lg">Serif Font (Fraunces)</p>
          <p className="font-display text-lg">Display Font (Cabinet Grotesk)</p>
        </div>
        
        {/* Animation Test */}
        <div className="bg-white p-6 rounded-2xl shadow-soft mt-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Animation Test</h2>
          <div className="flex space-x-4">
            <div className="animate-fade-in bg-primary-500 text-white p-4 rounded-xl">Fade In</div>
            <div className="animate-slide-up bg-secondary-500 text-white p-4 rounded-xl">Slide Up</div>
            <div className="animate-pulse-subtle bg-accent-500 text-white p-4 rounded-xl">Pulse</div>
          </div>
        </div>
      </div>
    </div>
  );
} 