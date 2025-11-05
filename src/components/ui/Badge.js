// src/components/ui/Badge.js
// Cursor Rules UI Primitive: Badge component
export default function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium bg-[rgb(var(--accent))] text-black/80">
      {children}
    </span>
  );
}

