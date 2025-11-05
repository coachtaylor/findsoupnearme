// src/components/ui/Card.js
// Cursor Rules UI Primitive: Card component
export default function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-[rgb(var(--surface))] ring-1 ring-black/5 shadow-sm hover:shadow-md transition ${className}`}>
      {children}
    </div>
  );
}

