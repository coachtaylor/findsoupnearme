// src/components/ui/Input.js
// Cursor Rules UI Primitive: Input component
export default function Input(props) {
  return (
    <input
      {...props}
      className="w-full h-11 px-4 rounded-xl bg-[rgb(var(--surface))] ring-1 ring-black/10 focus:ring-2 focus:ring-[rgb(var(--primary))]/40 outline-none placeholder:text-[rgb(var(--muted))] focus:outline-none focus:ring-offset-0"
    />
  );
}

