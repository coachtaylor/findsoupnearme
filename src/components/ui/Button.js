// src/components/ui/Button.js
// Cursor Rules UI Primitive: Button component
export default function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "inline-flex items-center justify-center h-11 px-5 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-offset-0";
  const variants = {
    primary: `${base} bg-[rgb(var(--primary))] text-white hover:opacity-90 focus:ring-[rgb(var(--primary))]/40`,
    ghost: `${base} border border-black/10 text-[rgb(var(--ink))] bg-[rgb(var(--surface))] hover:bg-black/5 focus:ring-[rgb(var(--primary))]/30`,
    subtle: `${base} bg-[rgb(var(--bg))] text-[rgb(var(--ink))] hover:bg-black/5 focus:ring-[rgb(var(--primary))]/30`
  };
  return <button className={(variants[variant] || variants.primary) + " " + className} {...props}>{children}</button>;
}

