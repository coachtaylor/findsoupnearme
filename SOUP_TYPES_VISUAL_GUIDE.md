# 🎨 Soup Types Feature - Visual Guide

## Page Layouts

### **1. Soup Types Index (`/soup-types`)**

```
╔══════════════════════════════════════════════════════════════╗
║                      NAVBAR (Fixed Top)                       ║
╚══════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────┐
│                   🎨 HERO SECTION                             │
│                  (Orange gradient bg)                         │
│                                                               │
│              ⬤        Explore Soup Types        ⬤           │
│         (floating gradient orbs)                             │
│                                                               │
│       Discover soups from around the world and               │
│       find restaurants near you serving favorites            │
│                                                               │
│   ┌────────────────────────────────────────────────┐        │
│   │  🔍  Search soup types...                       │        │
│   └────────────────────────────────────────────────┘        │
│                                                               │
│   [All Types] [Asian] [American] [Seafood] [European]       │
│   [Latin American] [Vegetarian]                              │
│                                                               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              🏆 POPULAR SOUPS SECTION                         │
│              (White to orange-50 gradient)                    │
│                                                               │
│              🎯 Most Popular                                  │
│                Fan Favorites                                  │
│       The most searched soup types on FindSoupNearMe         │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │▀▀▀▀▀▀▀▀▀▀│  │▀▀▀▀▀▀▀▀▀▀│  │▀▀▀▀▀▀▀▀▀▀│  │▀▀▀▀▀▀▀▀▀▀│   │
│  │ Ramen    │  │ Pho      │  │ Clam     │  │ French   │   │
│  │          │  │          │  │ Chowder  │  │ Onion    │   │
│  │ Japanese │  │ Vietnam  │  │ Creamy   │  │ Rich beef│   │
│  │ noodle...│  │ beef...  │  │ soup...  │  │ broth... │   │
│  │          │  │          │  │          │  │          │   │
│  │ Japan    │  │ Vietnam  │  │ USA      │  │ France   │   │
│  │ 234 spots│  │ 198 spots│  │ 187 spots│  │ 156 spots│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              📋 ALL SOUP TYPES BY CATEGORY                    │
│                                                               │
│   🔴 Asian Soups                                             │
│   ━━━━━━━━━━━━━━━━                                          │
│   Rich broths and noodles from East and Southeast Asia       │
│                                                               │
│   ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐              │
│   │ Ramen │  │ Pho   │  │ Miso  │  │ Wonton│              │
│   │ 234   │  │ 198   │  │ 156   │  │ 143   │              │
│   └───────┘  └───────┘  └───────┘  └───────┘              │
│   ... 4 more cards ...                                       │
│                                                               │
│   🔵 American Classics                                       │
│   ━━━━━━━━━━━━━━━━━━━                                      │
│   Comfort soups from across the United States                │
│   ... 5 soup cards ...                                       │
│                                                               │
│   ... 4 more categories ...                                  │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                 🎯 CTA SECTION                                │
│           (Orange gradient with pattern)                      │
│                                                               │
│              Ready to Find Your Soup?                         │
│      Search thousands of restaurants serving                  │
│              your favorite soups                              │
│                                                               │
│      [🔍 Search Restaurants]  [Browse by City]               │
└──────────────────────────────────────────────────────────────┘
```

---

### **2. Individual Soup Type Page (`/soup-types/ramen`)**

```
╔══════════════════════════════════════════════════════════════╗
║                      NAVBAR (Fixed Top)                       ║
╚══════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────┐
│          🎨 HERO SECTION (Soup-specific gradient)            │
│              (Red-to-orange for Ramen)                        │
│                                                               │
│   ← Back to All Soup Types                                   │
│                                                               │
│   ╭─────────────────────╮                                    │
│   │ Origin: Japan       │                                    │
│   ╰─────────────────────╯                                    │
│                                                               │
│              Ramen                                            │
│                                                               │
│   Japanese noodle soup with rich pork or chicken             │
│   broth, topped with soft-boiled eggs, green onions,         │
│   and tender slices of pork.                                 │
│                                                               │
│   ┌──────────────────┐  ┌──────────────────┐               │
│   │ ① Originated in  │  │ ② Over 30 diff   │               │
│   │    China, popu   │  │    regional styles│               │
│   │    larized Japan │  │                   │               │
│   └──────────────────┘  └──────────────────┘               │
│   ┌──────────────────┐  ┌──────────────────┐               │
│   │ ③ Broth simmered │  │ ④ Can contain    │               │
│   │    for 12+ hours │  │    over 1K cals  │               │
│   └──────────────────┘  └──────────────────┘               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              🔍 FILTERS & RESULTS                             │
│                                                               │
│   ┌────────────────────────────────────────────────────────┐ │
│   │ 🎛️ Filters                                             │ │
│   │                                                         │ │
│   │ State      City       Price        Sort By             │ │
│   │ [All ▼]   [All ▼]    [All ▼]      [Rating ▼]         │ │
│   └────────────────────────────────────────────────────────┘ │
│                                                               │
│   234 Restaurants                          📍 Showing All    │
│   ━━━━━━━━━━━━━━━                                           │
│                                                               │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│   │ 🏪          │  │ 🏪          │  │ 🏪          │        │
│   │ Ippudo      │  │ Ramen Bar   │  │ Tonkotsu    │        │
│   │             │  │             │  │             │        │
│   │ ⭐⭐⭐⭐⭐   │  │ ⭐⭐⭐⭐☆   │  │ ⭐⭐⭐⭐☆   │        │
│   │ 4.8 (324)   │  │ 4.5 (198)   │  │ 4.6 (256)   │        │
│   │             │  │             │  │             │        │
│   │ $$ Japanese │  │ $$ Ramen    │  │ $$$ Ramen   │        │
│   │ New York,NY │  │ LA, CA      │  │ Chicago, IL │        │
│   └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                               │
│   ... more restaurant cards ...                               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│           🌟 EXPLORE OTHER SOUPS SECTION                      │
│              (White to orange-50 gradient)                    │
│                                                               │
│              Explore Other Soup Types                         │
│      Discover more delicious soups from around the world     │
│                                                               │
│               [View All Soup Types →]                         │
└──────────────────────────────────────────────────────────────┘
```

---

## Color Coding

### **Category Gradients:**

```
🔴 Asian:       from-red-500 to-orange-500
               ━━━━━━━━━━━━━━━━━━━━━━━━━
               
🔵 American:    from-blue-500 to-indigo-500
               ━━━━━━━━━━━━━━━━━━━━━━━━━
               
🌊 Seafood:     from-teal-500 to-cyan-500
               ━━━━━━━━━━━━━━━━━━━━━━━━━
               
💜 European:    from-purple-500 to-pink-500
               ━━━━━━━━━━━━━━━━━━━━━━━━━
               
🌿 Latin:       from-green-500 to-lime-500
               ━━━━━━━━━━━━━━━━━━━━━━━━━
               
🥬 Vegetarian:  from-emerald-500 to-green-500
               ━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Component States

### **Soup Card - Normal:**
```
┌──────────────┐
│              │  Border: neutral-200
│  Ramen       │  Shadow: shadow-sm
│              │  Hover: ↓
│  Japanese... │
│              │
│  Japan  234+ │
└──────────────┘
```

### **Soup Card - Hover:**
```
┌──────────────┐
│              │  Border: orange-300
│  Ramen       │  Shadow: shadow-md
│              │  Transform: -translate-y-1
│  Japanese... │  Text: text-orange-600
│              │
│  Japan  234+ │
└──────────────┘
```

---

## Interactive Elements

### **Search Bar:**
```
┌─────────────────────────────────────────┐
│ 🔍  Search soup types...                │
│                                         │
│ Focus → Orange border + ring            │
│ Type  → Real-time filter                │
└─────────────────────────────────────────┘
```

### **Category Pills:**

**Inactive:**
```
┌──────────┐
│  Asian   │  bg-white, text-neutral-700
└──────────┘  border-neutral-200
```

**Active:**
```
┌──────────┐
│  Asian   │  bg-orange-500, text-white
└──────────┘  shadow-md
```

### **Filter Dropdowns:**
```
State:
┌──────────────┐
│ All States ▼ │  → Cascades to City filter
└──────────────┘

City:
┌──────────────┐
│ All Cities ▼ │  → Disabled until State selected
└──────────────┘  → Shows cities in selected State
```

---

## Responsive Breakpoints

### **Mobile (< 640px):**
```
┌──────────┐
│ Card 1   │  1 column grid
├──────────┤
│ Card 2   │  Stacked filters
├──────────┤
│ Card 3   │  Full-width buttons
└──────────┘
```

### **Tablet (640px - 1024px):**
```
┌──────┐ ┌──────┐
│ Card │ │ Card │  2 column grid
└──────┘ └──────┘  2 column filters
┌──────┐ ┌──────┐
│ Card │ │ Card │
└──────┘ └──────┘
```

### **Desktop (> 1024px):**
```
┌────┐ ┌────┐ ┌────┐ ┌────┐
│ C1 │ │ C2 │ │ C3 │ │ C4 │  4 column grid
└────┘ └────┘ └────┘ └────┘  4 column filters
┌────┐ ┌────┐ ┌────┐ ┌────┐  Hover effects
│ C5 │ │ C6 │ │ C7 │ │ C8 │
└────┘ └────┘ └────┘ └────┘
```

---

## Animations

### **Page Load:**
```
Hero Title:     Fade in + scale (0.3s)
Cards:          Stagger fade in (each 0.1s delay)
Filters:        Slide down (0.3s)
```

### **Interactions:**
```
Card Hover:     Lift up + shadow (0.2s)
Button Hover:   Scale + shadow (0.3s)
Filter Change:  Fade transition (0.2s)
```

### **Search:**
```
Type:           Instant filter (no delay)
Clear:          Fade out results
Results:        Fade in new results
```

---

## Typography Hierarchy

```
H1 (Page Title):
  text-5xl → text-7xl
  font-['Outfit']
  font-bold

H2 (Section):
  text-3xl → text-4xl
  font-['Outfit']
  font-bold

H3 (Card Title):
  text-lg → text-xl
  font-['Outfit']
  font-bold

Body Text:
  text-sm → text-base
  font-['Inter']
  font-normal

Labels:
  text-xs → text-sm
  font-['Inter']
  font-medium
```

---

## Spacing System

```
Container:     max-w-7xl mx-auto
Section:       py-12 → py-20
Card Padding:  p-6
Gap (grid):    gap-6
Gap (flex):    gap-3 → gap-4
```

---

## Shadow Hierarchy

```
Level 1:  shadow-sm      (cards at rest)
Level 2:  shadow-md      (cards on hover)
Level 3:  shadow-lg      (buttons)
Level 4:  shadow-xl      (primary CTAs)
Level 5:  shadow-2xl     (modals, popovers)
```

---

## Border Radius

```
Small:   rounded-lg     (8px)  - Buttons, inputs
Medium:  rounded-xl     (12px) - Cards
Large:   rounded-2xl    (16px) - Hero sections, CTAs
Full:    rounded-full   (9999px) - Badges, avatars
```

---

## Empty States

### **No Search Results:**
```
┌─────────────────────────────┐
│                             │
│          🔍                 │
│                             │
│    No soup types found      │
│                             │
│  Try adjusting your search  │
│        or filters           │
│                             │
│    [Clear Filters]          │
└─────────────────────────────┘
```

### **No Restaurants:**
```
┌─────────────────────────────┐
│                             │
│          📍                 │
│                             │
│   No restaurants found      │
│                             │
│  Try adjusting your filters │
│   or search in a different  │
│          area               │
│                             │
│   [Clear All Filters]       │
└─────────────────────────────┘
```

---

## Loading States

### **Skeleton Cards:**
```
┌──────────────┐
│ ░░░░░░░░░░   │  Animated pulse
│ ░░░░░░       │  bg-neutral-100
│              │  animate-pulse
│ ░░░░  ░░░░   │
└──────────────┘
```

### **Loading Text:**
```
Loading...
(with subtle fade animation)
```

---

## CTA Patterns

### **Primary CTA:**
```
┌──────────────────────────┐
│ 🔍 Search Restaurants    │  bg-orange-500
│                          │  text-white
│ Hover: bg-orange-600     │  scale-105
└──────────────────────────┘  shadow-xl
```

### **Secondary CTA:**
```
┌──────────────────────────┐
│   Browse by City         │  bg-transparent
│                          │  border-white
│ Hover: bg-orange-700/70  │  text-white
└──────────────────────────┘
```

### **Tertiary CTA:**
```
View All →    text-orange-600
              font-semibold
Hover:        text-orange-700
```

---

## Icon Usage

```
🔍 MagnifyingGlassIcon    Search
📍 MapPinIcon             Location/City
🎛️ FunnelIcon              Filters
⭐ StarIcon               Featured/Rating
← ArrowLeftIcon           Back navigation
→ Arrow (SVG)            Forward/Next
```

---

## Best Practices

### **Performance:**
- ✅ Lazy load images
- ✅ Preload fonts
- ✅ Minimize animations
- ✅ Optimize SVGs

### **Accessibility:**
- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Focus states

### **SEO:**
- ✅ Meta tags
- ✅ Structured URLs
- ✅ Alt text
- ✅ Heading hierarchy

---

## Quick Reference

**Primary Color:**  Orange-500 (#F97316)  
**Accent Color:**   Orange-600 (#EA580C)  
**Text Primary:**   Neutral-900 (#171717)  
**Text Secondary:** Neutral-600 (#525252)  
**Border:**         Neutral-200 (#E5E5E5)  
**Background:**     White / Orange-50  

**Fonts:**
- Headings: Outfit (600-800)
- Body: Inter (400-700)

**Grid:**
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 4 columns

---

**Visual Design Complete!** 🎨✨

