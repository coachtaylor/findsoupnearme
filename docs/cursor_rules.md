# Cursor UI Rules — FindSoupNearMe

_A single source of truth for a modern, clean, production UI. Paste this file into `/.cursor/rules.md` and keep it in version control. Cursor should follow these rules for all UI work._

---

## 0) Purpose & Stack
- **Goal:** Ship a timeless, modern interface that feels fast, trustworthy, and up to market standards — never “AI‑template” or over‑styled.
- **Stack assumptions:** Next.js (App Router) + TypeScript + TailwindCSS + Storybook. Minimal custom CSS.
- **Design values:** clarity, restraint, strong hierarchy, generous whitespace, accessible by default.

---

## 1) Tokens & Theme (do not invent new colors)
Define these CSS variables at the app root. Always reference via Tailwind's arbitrary color syntax, e.g. `bg-[rgb(var(--primary))]`.

```css
:root{
  --bg: 231 237 222;   /* #E7EDDE */
  --surface: 255 255 255; /* cards, panels */
  --ink: 17 24 39;     /* neutral ink for max contrast (gray-900) */
  --muted: 115 129 94; /* #73815e */
  --primary: 78 100 36;/* #4e6424 */
  --accent: 244 176 77;/* #F4B04D */
  --accent-light: 246 212 162;/* #F6D4A2 */
  --accent-light-light: 255 251 245;/* #fffbf5 */
}
```

**Usage cheats**
- Backgrounds: `bg-[rgb(var(--bg))]`, surfaces: `bg-[rgb(var(--surface))]`
- Text: `text-[rgb(var(--ink))]`, muted: `text-[rgb(var(--muted))]`
- Primary CTAs: `bg-[rgb(var(--primary))] text-white hover:opacity-90`
- Rings/borders: `ring-1 ring-black/5`, emphasize with `focus:ring-[rgb(var(--primary))]/40`
- Accent is **sparingly** used for badges/tiny highlights, not large blocks of text.

**Logo**
- Source provided: `Green Organic Illustrative Food Place Logo.svg`
- Store as `/public/logo.svg` and use with `<Logo />` component below.
- Do not recolor; pair with `--ink` text and `--surface` or `--bg` backgrounds.

```tsx
// app/components/Logo.tsx
export default function Logo(props: React.SVGProps<SVGSVGElement>){
  return (
    <svg {...props} role="img" aria-label="FindSoupNearMe" className={"h-7 w-auto"}>
      <use href="/logo.svg#root" />
    </svg>
  );
}
```
> If your exported SVG lacks internal symbols, import with `next/image` or inline the SVG. Keep height 28–32px in nav, up to 56px in footers.

---

## 2) Typography & Rhythm
- Headings: **Poppins** (600), body: **Inter** (400/500). Use system fallbacks.
- Scale: `h1 36–48`, `h2 28–32`, `h3 22–24`, body `16–18`. Always `tracking-tight` for h1/h2.
- Line length: body 55–75 characters. Truncate long labels with line clamps.

**Utilities**
- Headline: `text-4xl md:text-5xl font-semibold tracking-tight`
- Body: `text-base md:text-[17px] leading-7`

---

## 3) Layout, Spacing, Elevation
- Container: `max-w-7xl mx-auto px-4 md:px-6`
- Section padding: `py-16 md:py-24` (hero may use `py-20 md:py-28`)
- Grid gaps: `gap-6 md:gap-8` (cards), `gap-10 md:gap-12` (hero)
- Surfaces: `rounded-2xl bg-[rgb(var(--surface))] ring-1 ring-black/5 shadow-sm hover:shadow-md transition`
- Images: fixed aspect via `aspect-[16/9]` or `aspect-[4/3]`, `object-cover`, rounded corners; lazy load.

**Do not**: stack dense borders, overuse drop shadows, or collapse spacing below tokens above.

---

## 4) Motion & A11y
- Motion: subtle only (`opacity`, `translate`, `scale` 150–250ms). Respect `prefers-reduced-motion`.
- Focus: `focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/40 focus:ring-offset-0` on all interactive elements.
- Keyboard: predictable tab order; visible focus ring.
- Contrast: meet **WCAG AA** for text and interactive states.

---

## 5) Tailwind Conventions
- No inline styles (except CSS variables). No external CSS files for components.
- Use semantic HTML elements and ARIA where applicable.
- Prefer composition from primitives in `app/components/ui/*`.
- Keep class lists readable; group by layout → spacing → color → typography → state.

---

## 6) UI Primitives (compose everything from these)

### Button
```tsx
export function Button({children, variant="primary", className="", ...props}: any){
  const base = "inline-flex items-center justify-center h-11 px-5 rounded-xl transition focus:outline-none focus:ring-2";
  const variants: Record<string,string> = {
    primary: `${base} bg-[rgb(var(--primary))] text-white hover:opacity-90 focus:ring-[rgb(var(--primary))]/40`,
    ghost:   `${base} border border-black/10 text-[rgb(var(--ink))] bg-[rgb(var(--surface))] hover:bg-black/5 focus:ring-[rgb(var(--primary))]/30`,
    subtle:  `${base} bg-[rgb(var(--bg))] text-[rgb(var(--ink))] hover:bg-black/5 focus:ring-[rgb(var(--primary))]/30`
  };
  return <button className={(variants[variant]||variants.primary)+" "+className} {...props}>{children}</button>;
}
```

### Card
```tsx
export function Card({children, className=""}: any){
  return <div className={"rounded-2xl bg-[rgb(var(--surface))] ring-1 ring-black/5 shadow-sm hover:shadow-md transition "+className}>{children}</div>;
}
```

### Badge
```tsx
export function Badge({children}:{children: React.ReactNode}){
  return <span className="inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium bg-[rgb(var(--accent))] text-black/80">{children}</span>;
}
```

### Input
```tsx
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>){
  return <input {...props} className="w-full h-11 px-4 rounded-xl bg-[rgb(var(--surface))] ring-1 ring-black/10 focus:ring-2 focus:ring-[rgb(var(--primary))]/40 outline-none placeholder:text-[rgb(var(--muted))]"/>;
}
```

---

## 7) Component Specs

### Hero
- Layout: 2-col on `lg`, stacked on mobile. Container + `py-20 md:py-28`, gap-10/12.
- Content: eyebrow (brand), H1, subcopy, primary/secondary CTAs.
- Media: decorative image `aspect-[4/3]`, `rounded-3xl shadow-lg ring-1 ring-black/5`.
- **Acceptance:** no gradients/carousels, copy legible at 320px, hit targets ≥44px.

### CardGrid (restaurants)
- Grid: `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8`.
- Card: image `aspect-[16/9]` + body `p-4 md:p-5`; name as `h3` with `line-clamp-1`.
- Meta row: soup type, city, price, rating (★) in muted text.
- CTA row: primary "View", ghost "Save".
- **Acceptance:** no image distortion, no text overflow, Lighthouse a11y ≥90 for story.

### Navbar
- Sticky top, translucent surface (no blur), 64px height.
- Left: `<Logo />`; center: search input (md+), right: CTAs.
- Mobile: menu sheet with same tokens.

### Footer
- 3–4 columns, generous `py-16`, logo sized up to 56px, muted links.

### Modal
- Backdrop `bg-black/40`, panel is `Card` with bigger radius, trap focus.

---

## 8) Storybook Requirements (non-optional)
Every component must ship a Storybook story with:
- **Viewports:** 320, 768, 1280
- **States:** default, loading/skeleton, empty, long text, keyboard focus
- **Screenshots:** export from Storybook for PRs
- **A11y:** axe passes, focus visible

---

## 9) Quality Gate (PR checklist)
- Headings consistent; `tracking-tight` on h1/h2
- Sections ≥ `py-16`, inner gaps ≥ `gap-6`
- Contrast AA on all text/CTAs
- Images lazy, fixed aspect, meaningful alt
- `prefers-reduced-motion` respected
- Keyboard navigation and focus ring on all controls
- Empty states present with primary CTA

---

## 10) Refactor Rules (to avoid "AI‑flat")
- Do **not** remove design. If uncertain, prefer subtle design over removal.
- Reduce noise via fewer borders and lighter shadows (`shadow-sm`, `ring-1 ring-black/5`).
- Keep consistent radius `rounded-2xl` across cards, inputs, modals.
- Limit animation to `opacity/translate 200–300ms`.
- Any removal requires justification + better alternative.

---

## 11) Prompts for Cursor (copy when requesting work)

**Component request template**
```
Task: Build <ComponentName> according to `/.cursor/rules.md`.
Constraints: Tailwind only, use tokens via rgb(var(--...)), compose from primitives in `app/components/ui/*`.
Acceptance: add Storybook story (320/768/1280), a11y ≥90, no gradients, no external CSS.
Deliverables: TSX component + Storybook story, plus brief bullets of design choices.
```

**Design reviewer**
```
Act as a senior product designer. Critique output against hierarchy, spacing, contrast, and responsiveness. Propose ≤8 patches and apply them. Return diff + updated story screenshots.
```

---

## 12) Example Hero (reference)
```tsx
<section className="bg-[rgb(var(--bg))]">
  <div className="max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-28 grid lg:grid-cols-2 gap-10 md:gap-12">
    <div>
      <p className="text-[rgb(var(--muted))] font-medium mb-2">FindSoupNearMe</p>
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[rgb(var(--ink))]">Find the best soups near you</h1>
      <p className="mt-4 text-[rgb(var(--muted))] max-w-xl">Discover pho, ramen, chowder, and today’s specials around the corner.</p>
      <div className="mt-8 flex gap-3">
        <Button>Search soups near me</Button>
        <Button variant="ghost">Explore cities</Button>
      </div>
    </div>
    <div className="relative">
      <img src="/hero-bowl.jpg" alt="Steamy bowl of soup" className="w-full aspect-[4/3] object-cover rounded-3xl shadow-lg ring-1 ring-black/5" loading="lazy" />
    </div>
  </div>
</section>
```

---

_This ruleset is the contract. Cursor should refuse outputs that violate it and propose compliant alternatives instead._

