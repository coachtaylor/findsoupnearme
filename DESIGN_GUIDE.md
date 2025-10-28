# 🎨 FindSoupNearMe - Visual Design Guide

## Section-by-Section Breakdown

---

## 1. Hero Section

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              [🍜 10,000+ Soup Restaurants]              │
│                                                         │
│                Find Your Perfect                        │
│                   Bowl of Soup                          │
│         (gradient text: orange-500 to orange-700)       │
│                                                         │
│   From hearty ramen to comforting chowder, discover    │
│          the best soup restaurants in your city         │
│                                                         │
│  ┌────────────────────────────────────┬──────────┐     │
│  │ 📍 Enter your city or ZIP code...  │  Search  │     │
│  └────────────────────────────────────┴──────────┘     │
│                                                         │
│  Popular:  [🍜 Ramen]  [🥢 Pho]  [🥣 Chowder]  [🦞 Bisque]  │
│                                                         │
│    [📍 11 Cities]    [🍜 640+ Restaurants]   [❤️ 50K+ Diners]    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Visual Details:**
- Background: Soft orange gradient blobs on white
- Badge: White card with shadow
- Headline: 5xl-7xl bold, gradient text
- Search: Large, prominent with orange border
- Stats: Inline flex with icons and numbers

---

## 2. Popular Cities Section

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│              Explore Popular Cities                      │
│   Browse soup restaurants in major cities across the US  │
│                                                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │ 🗽           │ │ 🌴           │ │ 🌆           │    │
│  │ New York  245│ │ Los Angeles 198│ │ Chicago  167│    │
│  │ NY           │ │ CA           │ │ IL           │    │
│  │ → Explore    │ │ → Explore    │ │ → Explore    │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
│                                                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │ 🌉           │ │ ☕           │ │ 🏖️           │    │
│  │ San Francisco│ │ Seattle   156│ │ Miami    178│    │
│  │ CA        189│ │ WA           │ │ FL           │    │
│  │ → Explore    │ │ → Explore    │ │ → Explore    │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
│                                                          │
│               [View All Cities →]                        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Visual Details:**
- Background: White to soft orange gradient
- Cards: White with subtle shadows
- Hover: Lift up, stronger shadow, orange border
- Emoji: Large (4xl) on left
- Restaurant count: Bold orange number

---

## 3. Featured Restaurants Section

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                [⭐ Featured]                             │
│              Top Rated Soup Spots                        │
│      Handpicked restaurants serving the most delicious   │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │  Image   │ │  Image   │ │  Image   │                │
│  │          │ │          │ │          │                │
│  │──────────│ │──────────│ │──────────│                │
│  │ Name     │ │ Name     │ │ Name     │                │
│  │ ⭐ 4.8   │ │ ⭐ 4.9   │ │ ⭐ 4.7   │                │
│  │ Location │ │ Location │ │ Location │                │
│  │ [Ramen]  │ │ [Pho]    │ │ [Chowder]│                │
│  │ Details  │ │ Details  │ │ Details  │                │
│  └──────────┘ └──────────┘ └──────────┘                │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │  Image   │ │  Image   │ │  Image   │                │
│  │  ...     │ │  ...     │ │  ...     │                │
│  └──────────┘ └──────────┘ └──────────┘                │
│                                                          │
│           [Browse All Restaurants →]                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Visual Details:**
- Uses existing RestaurantCard component
- 3-column grid on desktop
- 2-column on tablet
- 1-column on mobile
- Consistent spacing and shadows

---

## 4. How It Works Section

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                   How It Works                           │
│       Finding your perfect bowl of soup is as easy       │
│                      as 1-2-3                            │
│                                                          │
│     ┌────┐              ┌────┐              ┌────┐      │
│     │ 1  │              │ 2  │              │ 3  │      │
│     └─┬──┘              └─┬──┘              └─┬──┘      │
│  ┌────┴─────┐       ┌────┴─────┐       ┌────┴─────┐    │
│  │          │       │          │       │          │    │
│  │   📍     │ ───▶  │   🔍     │ ───▶  │   ⭐     │    │
│  │          │       │          │       │          │    │
│  │   Find   │       │  Browse  │       │   Read   │    │
│  │   Your   │       │   Soup   │       │  Reviews │    │
│  │ Location │       │   Spots  │       │          │    │
│  │          │       │          │       │          │    │
│  │ Search by│       │ Explore  │       │ Check    │    │
│  │ city or  │       │ by type  │       │ ratings  │    │
│  │ ZIP code │       │ & rating │       │ & reviews│    │
│  └──────────┘       └──────────┘       └──────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Visual Details:**
- White cards with subtle shadows
- Numbered badges at top (orange gradient circle)
- Large icons in orange background squares
- Arrow connectors on desktop
- Stacked vertically on mobile

---

## 5. Final CTA Section

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│        [Orange gradient background with pattern]         │
│                                                          │
│           Ready to Find Your Perfect Soup?               │
│                                                          │
│      Join thousands of soup lovers discovering amazing   │
│           restaurants in their city                      │
│                                                          │
│   ┌────────────────────┐  ┌────────────────────┐        │
│   │ 🔍 Start Exploring │  │ 📍 Browse Cities   │        │
│   └────────────────────┘  └────────────────────┘        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Visual Details:**
- Full-width orange gradient background
- White text
- Subtle pattern overlay
- Two buttons: solid white and outlined
- High contrast for visibility

---

## Color Palette

### Primary Colors
```
Orange 500: #f97316  ████  (Primary CTA)
Orange 600: #ea580c  ████  (Primary hover)
Orange 700: #c2410c  ████  (Dark accent)
Orange 50:  #fff7ed  ░░░░  (Light background)
Orange 100: #ffedd5  ░░░░  (Lighter background)
```

### Neutral Colors
```
Neutral 900: #171717  ████  (Headlines)
Neutral 800: #262626  ████  (Strong text)
Neutral 700: #404040  ████  (Body text)
Neutral 600: #525252  ████  (Secondary text)
Neutral 500: #737373  ████  (Muted text)
Neutral 200: #e5e5e5  ░░░░  (Borders)
Neutral 100: #f5f5f5  ░░░░  (Background)
White:       #ffffff  ░░░░  (Cards)
```

### Gradients
```
Primary Gradient:     from-orange-500 to-orange-600
Background Gradient:  from-orange-50 via-white to-white
Text Gradient:        from-orange-500 via-orange-600 to-orange-700
CTA Gradient:         from-orange-500 to-orange-700
```

---

## Typography Scale

### Headlines
```
Hero Title:        text-5xl sm:text-6xl lg:text-7xl (48-72px)
Section Title:     text-3xl lg:text-4xl (30-36px)
Card Title:        text-xl (20px)
```

### Body Text
```
Hero Subtitle:     text-xl lg:text-2xl (20-24px)
Section Subtitle:  text-lg (18px)
Body:              text-base (16px)
Small:             text-sm (14px)
```

### Font Weights
```
Bold Headlines:    font-bold (700)
Semibold CTAs:     font-semibold (600)
Medium Labels:     font-medium (500)
Regular Body:      font-normal (400)
```

---

## Spacing System

### Section Spacing
```
Section Padding:   py-20 (80px top/bottom)
Container:         px-4 sm:px-6 lg:px-8
Max Width:         max-w-5xl (1024px)
```

### Grid Spacing
```
Grid Gap:          gap-6 (24px) or gap-8 (32px)
Card Padding:      p-6 (24px) or p-8 (32px)
Element Margin:    mb-4 (16px) to mb-12 (48px)
```

---

## Border Radius

### Standard Sizes
```
Small:    rounded-lg (8px)    - Tags, badges
Medium:   rounded-xl (12px)   - Buttons, small cards
Large:    rounded-2xl (16px)  - Main cards, sections
XL:       rounded-3xl (24px)  - Hero elements
Full:     rounded-full        - Circular elements
```

---

## Shadow System

### Standard Shadows
```
Light:    shadow-sm     - Subtle cards
Medium:   shadow-lg     - Important cards
Strong:   shadow-xl     - Featured elements
Hover:    shadow-2xl    - Hover states
```

### Custom Shadows
```
Card Default:  shadow-sm border border-neutral-100
Card Hover:    shadow-xl border-orange-200
```

---

## Animation Guidelines

### Transitions
```
Fast:     duration-200   (200ms) - Micro-interactions
Normal:   duration-300   (300ms) - Standard transitions
Slow:     duration-500   (500ms) - Complex animations
```

### Hover Effects
```
Scale:        hover:scale-105 (5% larger)
Translate:    hover:-translate-y-1 (4px up)
Shadow:       hover:shadow-xl
```

### Easing
```
Standard:     ease-in-out
Smooth:       transition-all duration-300
```

---

## Responsive Breakpoints

### Tailwind Default
```
sm:   640px   (Small devices)
md:   768px   (Medium devices)
lg:   1024px  (Large devices)
xl:   1280px  (Extra large)
2xl:  1536px  (2X extra large)
```

### Usage in Design
```
Mobile:   < 640px    - Stack everything, full width
Tablet:   640-1024px - 2 columns, reduce spacing
Desktop:  > 1024px   - 3 columns, full effects
```

---

## Icon Usage

### Primary Icons (Heroicons Outline)
```
MagnifyingGlassIcon  - Search functionality
MapPinIcon           - Location/geography
StarIcon             - Ratings/featured
HeartIcon            - Favorites/likes
```

### Icon Sizes
```
Small:   w-4 h-4 (16px)
Medium:  w-6 h-6 (24px)
Large:   w-8 h-8 (32px)
XL:      w-10 h-10 (40px)
```

---

## Component States

### Button States
```
Default:   bg-orange-500
Hover:     bg-orange-600 scale-105 shadow-xl
Active:    bg-orange-700 scale-95
Focus:     ring-4 ring-orange-100
Disabled:  bg-neutral-300 cursor-not-allowed
```

### Card States
```
Default:   shadow-sm border-neutral-100
Hover:     shadow-xl -translate-y-1 border-orange-200
Active:    shadow-md scale-98
```

### Input States
```
Default:   border-orange-200
Focus:     border-orange-500 ring-4 ring-orange-100
Error:     border-red-500 ring-red-100
Success:   border-green-500 ring-green-100
```

---

## Accessibility Features

### Focus States
```
All interactive elements have visible focus rings
Focus ring: ring-4 ring-orange-100
Outline offset: outline-offset-2
```

### Color Contrast
```
Headlines on white:     21:1 (AAA)
Body text on white:     7:1 (AAA)
Orange on white:        4.5:1 (AA)
White on orange:        4.5:1 (AA)
```

### Touch Targets
```
Minimum size: 44x44px (w-11 h-11)
Button padding: px-8 py-4
Icon buttons: p-3 (48x48px total)
```

---

## Loading States

### Skeleton Loaders
```
┌──────────────┐
│ ░░░░░░░░░░░░ │  (Shimmer animation)
│ ░░░░░░░░     │
│ ░░░░░░       │
└──────────────┘
```

### Properties
```
Background: bg-neutral-200
Animation: animate-pulse
Border radius: Matches content
```

---

## Mobile Optimizations

### Mobile-Specific Changes
- Hero text: Reduced to text-4xl
- Search: Stacked vertically
- City grid: 1 column
- Restaurant grid: 1 column
- How It Works: Stacked, no connectors
- Reduced padding: py-12 instead of py-20

### Touch Optimizations
- Larger tap targets (min 44px)
- More spacing between interactive elements
- Simplified hover states
- Better contrast for outdoor viewing

---

## Performance Considerations

### Image Optimization
- Use next/image for all images
- Lazy load below-the-fold content
- Provide width/height attributes
- Use appropriate image formats (WebP)

### Code Splitting
- Dynamic imports for heavy components
- Lazy load SearchBar component
- Split routes properly

### CSS Optimization
- Use Tailwind JIT mode
- Purge unused styles
- Minimize custom CSS
- Use CSS containment where appropriate

---

## Browser Support

### Target Browsers
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- iOS Safari: Last 2 versions
- Samsung Internet: Last 2 versions

### Fallbacks
- Gradient fallbacks to solid colors
- Animation fallbacks for older browsers
- Backdrop-filter fallbacks
- Grid fallback to flexbox where needed

---

## Testing Checklist

### Visual Testing
- [ ] All sections render correctly
- [ ] Images load properly
- [ ] Colors match design
- [ ] Typography is consistent
- [ ] Spacing is correct

### Interaction Testing
- [ ] Search works
- [ ] All links navigate correctly
- [ ] Buttons have proper hover states
- [ ] Forms validate properly
- [ ] Loading states display

### Responsive Testing
- [ ] Mobile (320px-640px)
- [ ] Tablet (640px-1024px)
- [ ] Desktop (1024px+)
- [ ] Large desktop (1440px+)

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast passes
- [ ] Focus indicators visible
- [ ] Alt text on images

---

## Quick Reference

### Most Used Classes
```css
/* Buttons */
.primary-button {
  @apply px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 
         text-white font-semibold rounded-2xl shadow-lg 
         hover:shadow-xl hover:scale-105 transition-all duration-300;
}

/* Cards */
.card {
  @apply bg-white rounded-2xl p-6 shadow-sm border border-neutral-100
         hover:shadow-xl hover:-translate-y-1 transition-all duration-300;
}

/* Headings */
.section-title {
  @apply text-3xl lg:text-4xl font-bold text-neutral-900 mb-4;
}

/* Input */
.search-input {
  @apply w-full px-4 py-4 rounded-2xl border-2 border-orange-200
         focus:border-orange-500 focus:ring-4 focus:ring-orange-100 
         outline-none transition-all;
}
```

---

**Last Updated:** October 28, 2025
**Design System Version:** 2.0

