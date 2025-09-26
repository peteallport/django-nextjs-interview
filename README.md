# Activity Timeline with Interactive Minimap

👋 **Welcome, Upside team!**

Thank you for taking the time to review my takehome assignment! I enjoyed building this interactive activity timeline and minimap, and I hope the implementation and documentation make my approach clear. Please let me know if you have any questions. I'm excited to discuss my work and learn more about Upside!

Happy reviewing!

## Implementation Summary (2 Hours)

Successfully built a full-stack activity timeline application with:

- ✅ **Django REST API** with paginated endpoints and aggregations
- ✅ **Progressive loading** with true infinite scroll (100 items per page)
- ✅ **Interactive minimap** with line chart showing daily IN activities
- ✅ **First touchpoint markers** for each person
- ✅ **Click-to-navigate** from minimap to table
- ✅ **Real-time sync** between table scroll position and minimap indicators
- ✅ **Clean, modern UI** with TailwindCSS styling
- ✅ **Tooltips** showing email on person hover
- ✅ **Date gap indicators** in the timeline
- ✅ **Optimized loading** - minimap data loads in parallel with first page
- ✅ **Interactive chart points** with pointer cursor for better UX

## Implementation Approach

### Timeline (2 hours)

- **0:00-0:20** - Planning & setup
- **0:20-1:00** - Core development (backend APIs + frontend table)
- **1:00-2:00** - Minimap visualization & interactions

### Tech Stack & Libraries

**Backend (Django)**

- Django REST Framework for robust API endpoints
- Pagination & filtering for efficient data loading
- Aggregation endpoints for chart data

**Frontend (Next.js)**

- **recharts** - For the line chart minimap
- **date-fns** - Date formatting & relative time calculations
- **react-intersection-observer** - Infinite scroll implementation
- **TailwindCSS** - Already configured, for styling
- **Native fetch API** - For HTTP requests (no external dependencies needed)

### Key Architecture Decisions

1. **API Design**

   - `/api/activities/` - Paginated activity events with cursor-based pagination
   - `/api/activities/aggregated/` - Daily counts for minimap chart
   - `/api/persons/` - Person data with efficient lookups

2. **Frontend State Management**

   - React hooks for local state (visible date range, scroll position)
   - SWR or React Query for data fetching & caching
   - Virtual scrolling consideration for large datasets

3. **Performance Optimizations**
   - Debounced scroll handlers for minimap updates
   - Memoized calculations for date gaps
   - Lazy loading of person tooltips

### Implementation Progress

#### Phase 1: Backend Setup ✅

- ✅ Created Django REST Framework serializers
- ✅ Implemented paginated activity endpoint with filtering
- ✅ Created aggregation endpoint for daily activity counts
- ✅ Built first touchpoints endpoint for minimap markers
- ✅ Added combined data endpoint for initial load optimization

#### Phase 2: Frontend Foundation ✅

- ✅ Installed dependencies (recharts, date-fns, react-intersection-observer)
- ✅ Created ActivityTable component with infinite scroll
- ✅ Implemented person name/email tooltips on hover
- ✅ Added date gap indicators between activities

#### Phase 3: Interactive Minimap ✅

- ✅ Built line chart with daily IN activity counts
- ✅ Added circular markers for first touchpoints per person
- ✅ Implemented blue active region indicators for visible range
- ✅ Added click-to-navigate functionality

#### Phase 4: Polish & Sync ✅

- ✅ Real-time sync between table scroll and minimap
- ✅ Smooth scrolling animations
- ✅ Clean, modern UI with TailwindCSS
- ✅ Loading states and error handling
- ✅ Added pointer cursor to interactive chart elements

## Last-Minute Improvements (Final Minutes)

- ✅ **Fixed all TypeScript linter errors** for cleaner code
- ✅ **Added loading skeletons** for better perceived performance
- ✅ **Enhanced error handling** with retry functionality
- ✅ **Performance optimization** with debounced scroll handlers

## TODOs / Future Improvements

- **Performance**: Implement virtual scrolling for very large datasets
- **Caching**: Add Redis caching for aggregated data
- **Search**: Add filtering by person, channel, or date range
- **Export**: CSV/Excel export functionality
- **Real-time**: WebSocket updates for new activities
- **Testing**: Unit tests for critical paths
- **Accessibility**: ARIA labels and keyboard navigation
- **Analytics**: Track user interactions and usage patterns
- **Mobile**: Responsive design optimizations for mobile devices

## Trade-offs Made

- **Component library**: Using pre-built Recharts vs custom D3 implementation
- **State management**: Using React hooks vs Redux for simplicity in 2-hour window
- **HTTP client**: Using native fetch API instead of axios to reduce dependencies
- **Error handling**: Basic error logging vs comprehensive error boundaries
- **Caching**: No caching layer for API responses in this MVP

## Quick Start

```bash
# Option 1: Use the setup script
chmod +x load_data.sh
./load_data.sh

# Option 2: Manual setup

# Backend setup
cd server
pip3 install -r requirements.txt
python3 manage.py migrate
python3 manage.py ingest_persons data/persons.jsonl
python3 manage.py ingest_activityevents data/account_31crr1tcp2bmcv1fk6pcm0k6ag.jsonl
python3 manage.py runserver

# Frontend setup (in new terminal)
cd client
npm install
npm run dev
```

Visit http://localhost:3000 to view the application.
