# FindSoupNearMe.com

![FindSoupNearMe Logo](https://placeholder-for-logo-url.com/logo.png)

> The #1 platform for discovering, rating, and ordering soup from restaurants across U.S. cities.

## 📋 Project Overview

FindSoupNearMe.com is a hyperlocal food directory that connects soup lovers with the perfect bowl in their area. Our platform helps users discover, rate, and order soup from restaurants across major U.S. cities, while providing restaurants with a specialized marketing channel for their soup offerings.

### 🚀 Vision

To become the #1 soup discovery platform in the U.S., offering an emotional, trusted, and user-driven guide to warm, nourishing meals.

### 🔗 Links

- [Production Site](https://findsoupnearme.com) *(coming soon)*
- [Staging Environment](https://staging.findsoupnearme.com) *(coming soon)*
- [Design Files](https://figma.com/file/...) *(coming soon)*
- [PRD Document](./docs/PRD.md)
- [GitHub Repository](https://github.com/coachtaylor/findsoupnearme)

## 🛠️ Tech Stack

- **Frontend**: Next.js 13.4.10, React 18.2.0, Tailwind CSS 3.3.3
- **Backend**: Supabase (PostgreSQL) with Row Level Security
- **APIs**: Google Maps API, Supabase REST API
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS with custom soup-themed design system
- **Development Tools**: Cursor, Claude, GitHub
- **Package Manager**: npm with ES modules

## 📊 Project Status

### 🎉 **Major Progress Update**
**Your project has made significant progress and is very close to being fully functional!**

### ✅ **Completed Tasks**

**Project Setup & Infrastructure:**
- ✅ Next.js project structure with proper configuration
- ✅ Tailwind CSS setup with custom soup-themed design system
- ✅ Supabase client configuration and helper functions
- ✅ Basic project structure with organized directories
- ✅ Package.json with all necessary dependencies
- ✅ Custom CSS with soup-themed styling and animations
- ✅ Environment configuration setup
- ✅ Git repository with GitHub integration

**Database & Backend:**
- ✅ Complete database schema created and deployed to Supabase
- ✅ Migration files successfully run (001_initial_schema.sql, 002_add_image_columns.sql)
- ✅ Supabase client configuration with helper functions
- ✅ Row Level Security (RLS) policies defined
- ✅ Database indexes for performance optimization
- ✅ Automatic timestamp triggers for data tracking
- ✅ User authentication schema and triggers

**Data Pipeline (FULLY FUNCTIONAL):**
- ✅ Google Maps API scraper for restaurant data collection
- ✅ Complete restaurant data collector script with image handling
- ✅ Data enrichment script with AI integration
- ✅ Comprehensive soup type categorization (30+ soup types)
- ✅ Restaurant feature detection and classification
- ✅ Data normalization and formatting utilities
- ✅ **COMPLETE DATA IMPORT SYSTEM**: All 11 cities imported to database
- ✅ Automated data processing pipeline for multiple cities
- ✅ Duplicate detection and cleanup scripts
- ✅ Data quality assurance and validation
- ✅ Image upload to Supabase Storage for restaurant exteriors and food photos

**API Development:**
- ✅ **REST API endpoints for restaurant data** - `/api/restaurants` with filtering, pagination, and search
- ✅ **Search API** - `/api/search` with query-based restaurant search
- ✅ **Individual restaurant API** - `/api/restaurants/[id]` for detailed restaurant data
- ✅ **API error handling and fallback data** for development
- ✅ **Test API endpoint** - `/api/test-supabase` for database connectivity

**Frontend Components:**
- ✅ Main layout component with responsive navigation
- ✅ Footer component with comprehensive links and information
- ✅ Homepage with hero section, featured restaurants, and search functionality
- ✅ Basic routing structure for dynamic pages
- ✅ Authentication context setup with Supabase
- ✅ Responsive design with mobile-first approach
- ✅ **RestaurantCard component** - Complete with ratings, soup types, and navigation
- ✅ **RestaurantList component** - Complete with API integration, loading states, and filtering
- ✅ **SearchBar component** - Complete with form handling and navigation
- ✅ **RestaurantListingPage component** - Complete with filtering, pagination, and search
- ✅ **SkeletonLoader component** - Complete with loading states

**Frontend-Database Connection:**
- ✅ **Homepage connected to database** - Featured restaurants and city listings are now dynamic
- ✅ **useRestaurants hook** - Complete with API integration and error handling
- ✅ **Restaurant listing pages** - `/restaurants` page fully functional with real data
- ✅ **Search functionality** - Search API connected and functional
- ✅ **Filtering and pagination** - Complete implementation with soup type and rating filters

**Design System:**
- ✅ Custom color palette (soup-red, soup-orange, soup-brown, etc.)
- ✅ Typography setup with Inter, Merriweather, and Playfair Display fonts
- ✅ Custom animations (steam effect)
- ✅ Responsive design patterns and component classes
- ✅ Accessibility-focused styling and focus states

---

## 🚧 **Current Development Status**

### ⚠️ **Critical Issues to Address**

**Application Features:**
- ⚠️ **Restaurant detail pages** - Page exists but shows empty content (critical blocker)
- ⚠️ **User authentication flows** - Context exists but no login/register pages
- ⚠️ **Review system** - Database schema exists but no frontend implementation
- ⚠️ **City/State pages** - Dynamic routing exists but pages are empty

### ❌ **Remaining Core Features**

**Core Features:**
- ❌ Restaurant detail pages with real data (page exists but is empty) - **Sprint 1 Priority**
- ❌ User authentication flows and protected routes (no login/register pages) - **Sprint 2A Priority**
- ❌ Review system with user interactions (schema exists, no frontend) - **Sprint 2B Priority**
- ❌ Restaurant owner dashboard and management - **Sprint 3 Priority**
- ❌ Payment integration (Stripe) - **Sprint 4 Priority**
- ❌ Ordering system integration with delivery services - **Future**

**API Development:**
- ✅ REST API endpoints for restaurant data
- ✅ Search API with filtering capabilities
- ❌ Review management API - **Sprint 2B**
- ❌ User management API - **Sprint 2A**

---

## 🚀 **Next Steps Roadmap**

### **Sprint 1 - Critical Fixes (2-3 days)**

**Priority 1: Fix Restaurant Detail Pages**
- **Issue**: Restaurant detail pages (`/[state]/[city]/[restaurant]`) exist but show empty content
- **Solution**: Connect the existing page component to the restaurant API
- **Files to modify**: `src/pages/[state]/[city]/[restaurant].js`
- **Estimated time**: 1 day

**Priority 2: Connect City/State Pages**
- **Issue**: Dynamic routing exists but city/state pages are empty
- **Solution**: Implement city and state listing pages using existing RestaurantList component
- **Files to modify**: `src/pages/[state]/index.js`, `src/pages/[state]/[city]/index.js`
- **Estimated time**: 1 day

**Priority 3: Environment Setup**
- **Issue**: Missing `.env.example` file for easy setup
- **Solution**: Create comprehensive environment variables documentation
- **Files to create**: `.env.example`
- **Estimated time**: 0.5 days

### **Sprint 2A - User Authentication (3-4 days)**

**Priority 1: Authentication Pages**
- **Create login page** with Supabase Auth integration
- **Create registration page** with email verification
- **Implement protected routes** for authenticated features
- **Add user profile management**

**Priority 2: User Management API**
- **Create user profile API endpoints**
- **Implement user preferences and settings**
- **Add user dashboard for managing reviews and favorites**

### **Sprint 2B - Review System (3-4 days)**

**Priority 1: Review Display**
- **Show existing reviews** on restaurant detail pages
- **Implement review filtering and sorting**
- **Add review helpfulness voting system**

**Priority 2: Review Creation**
- **Create review submission form** with star ratings and text
- **Implement review editing and deletion** (owner only)
- **Add review moderation system**

**Priority 3: Review Management API**
- **Create review CRUD endpoints**
- **Implement review ownership validation**
- **Add review analytics and reporting**

### **Sprint 3 - Restaurant Owner Tools (4-5 days)**

**Priority 1: Restaurant Claiming**
- **Create restaurant claiming process** with verification
- **Implement owner dashboard** for content management
- **Add restaurant profile editing** capabilities

**Priority 2: Owner Features**
- **Allow owners to update** hours, photos, and soup menus
- **Implement review response** functionality
- **Add analytics dashboard** for restaurant performance

### **Sprint 4 - Enhanced Features (3-4 days)**

**Priority 1: Maps Integration**
- **Integrate Google Maps** with restaurant locations
- **Add interactive map view** for restaurant discovery
- **Implement location-based search** and filtering

**Priority 2: Payment Integration**
- **Set up Stripe integration** for premium features
- **Implement subscription management** for restaurant owners
- **Add payment processing** for featured listings

### **Future Enhancements**

**Priority 1: Ordering System**
- **Integrate with delivery services** (UberEats, DoorDash, Grubhub)
- **Implement affiliate link tracking** for revenue
- **Add order status tracking**

**Priority 2: Advanced Features**
- **Implement recommendation engine** based on user preferences
- **Add social features** (following, sharing, recommendations)
- **Create mobile app** using React Native

---

## 🛠️ **Development Setup**

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Google Maps API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/coachtaylor/findsoupnearme.git
   cd findsoupnearme
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env.local file with the following variables:
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Run database migrations**
   ```bash
   npm run migrate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run scrape` - Run restaurant data collection
- `npm run enrich` - Run data enrichment process
- `npm run import` - Import data to Supabase

---

## 📁 **Project Structure**

```
findsoupnearme/
├── src/
│   ├── components/          # React components
│   │   ├── layout/         # Layout components
│   │   ├── restaurant/     # Restaurant-related components
│   │   ├── search/         # Search components
│   │   └── ui/            # UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   ├── pages/             # Next.js pages
│   │   ├── api/           # API routes
│   │   └── [state]/       # Dynamic routing
│   └── styles/            # Global styles
├── scripts/
│   ├── data-collection/   # Data collection scripts
│   └── data-migration/    # Database migration scripts
├── supabase/
│   └── migrations/        # Database migrations
├── docs/                  # Documentation
└── public/               # Static assets
```

---

## 🤝 **Contributing**

This project is currently in active development. For major changes, please open an issue first to discuss what you would like to change.

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 **Contact**

- **Project Link**: [https://github.com/coachtaylor/findsoupnearme](https://github.com/coachtaylor/findsoupnearme)
- **Email**: coachtaylorp04@gmail.com

---

*Last updated: January 2025*