# 🛫 neuraplanner - AI-Powered Trip Planning

## Overview

**neuraplanner** is an AI-powered trip planning application integrated into the neurastack platform. It provides a conversational interface for planning complete trips, including flights, hotels, and restaurant reservations, with zero visible booking fees through affiliate partnerships.

## Features

### 🤖 Conversational Trip Planning
- Natural language trip planning through chat interface
- Progressive disclosure of travel preferences
- AI-powered recommendations based on user input
- Real-time search results integrated into conversation

### ✈️ Flight Search & Booking
- **Powered by Skyscanner API**
- Real-time flight search across multiple airlines
- Direct booking links with affiliate tracking
- Price comparison and filtering options
- Support for roundtrip, one-way, and multi-city trips

### 🏨 Hotel Search & Booking
- **Powered by Booking.com & Skyscanner Hotels**
- Comprehensive hotel search with ratings and amenities
- Price per night and total cost calculations
- High-quality hotel images and descriptions
- Direct booking with commission tracking

### 🍽️ Restaurant Reservations
- **Powered by OpenTable API**
- Restaurant search by location and cuisine
- Real-time availability and reservation booking
- Rating and price range information
- Seamless in-app reservation flow

### 📱 Trip Management
- Create and manage multiple trip itineraries
- Add flights, hotels, and restaurants to trips
- Real-time cost tracking and budgeting
- Trip sharing and collaboration features
- Mobile-optimized responsive design

## API Integration Strategy

### Commission-Based Revenue Model
All integrations use affiliate/commission models with **$0 visible fees** to users:

1. **Skyscanner Travel API**
   - Commission on flight bookings
   - White-label booking experience
   - Comprehensive airline coverage

2. **Booking.com Affiliate API**
   - Commission on hotel reservations
   - Global hotel inventory
   - Competitive pricing

3. **OpenTable API**
   - Commission per restaurant reservation
   - No cost to users for reservations
   - Extensive restaurant network

### Development vs Production

- **Development Mode**: Uses mock data for testing and demo
- **Production Mode**: Integrates with real APIs when keys are provided
- Graceful fallback to mock data if APIs are unavailable

## Technical Architecture

### Frontend Components
```
src/pages/NeuraplannerPage.tsx          # Main trip planning interface
src/components/TravelChatInput.tsx      # Specialized chat input with suggestions
src/components/FlightCard.tsx           # Flight search result display
src/components/HotelCard.tsx            # Hotel search result display
src/components/RestaurantCard.tsx       # Restaurant search result display
src/components/TripSidebar.tsx          # Trip management sidebar
```

### State Management
```
src/store/useTravelStore.tsx            # Zustand store for travel data
src/lib/travelApi.ts                    # API integration layer
src/lib/types.ts                        # TypeScript interfaces
```

### API Integration
- RESTful API calls with error handling
- Request caching and deduplication
- Offline support with cached data
- Real-time search with debouncing

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env.local` and configure:

```bash
# Required for production API integration
VITE_SKYSCANNER_API_KEY=your_skyscanner_api_key
VITE_OPENTABLE_API_KEY=your_opentable_api_key
VITE_AFFILIATE_ID=your_affiliate_id

# Optional - defaults to mock data in development
VITE_ENABLE_MOCK_DATA=true
```

### 2. API Key Setup

#### Skyscanner API
1. Sign up at [Skyscanner Partners](https://partners.skyscanner.net/)
2. Apply for API access
3. Get your API key and affiliate ID
4. Add to environment variables

#### OpenTable API
1. Sign up at [OpenTable Platform](https://platform.otrestaurants.com/)
2. Apply for partner access
3. Get your API credentials
4. Configure affiliate tracking

### 3. Development
```bash
npm install
npm run dev
```

Navigate to `/apps/neuraplanner` to access the trip planner.

## User Experience Flow

### 1. Initial Interaction
- User opens neuraplanner from the app store
- Presented with clean, travel-focused chat interface
- Quick suggestion buttons for common queries

### 2. Trip Planning Conversation
```
User: "Find flights from NYC to Paris for next month"
AI: "I found 5 flight options from NYC to Paris. Here are the best matches:"
[Flight cards with booking options]

User: "Show me hotels in Paris"
AI: "Here are top-rated hotels in Paris for your dates:"
[Hotel cards with pricing and amenities]

User: "Add the Delta flight and Hotel Ritz to my trip"
AI: "Added to your trip! Your total is now $1,250. Would you like restaurant recommendations?"
```

### 3. Trip Management
- All selected items automatically added to trip itinerary
- Real-time cost tracking and budget management
- Easy trip sharing and modification
- Booking links maintain affiliate tracking

## Mobile Optimization

### Responsive Design
- Mobile-first approach following user preferences
- Touch-optimized interface elements
- Swipe gestures for trip navigation
- Optimized for one-handed use

### Progressive Web App
- Offline trip viewing and planning
- Push notifications for price alerts
- Add to home screen functionality
- Fast loading with service worker caching

## Revenue Model

### Zero User Fees
- No booking fees charged to users
- No markup on displayed prices
- Transparent pricing matching partner sites

### Commission Structure
- **Flights**: 2-5% commission from Skyscanner
- **Hotels**: 3-7% commission from Booking.com
- **Restaurants**: $1-3 per reservation from OpenTable
- **Estimated Revenue**: $10-50 per completed trip

### Monetization Optimization
- A/B testing of booking flows
- Conversion rate optimization
- Partner relationship management
- Performance analytics and reporting

## Future Enhancements

### Phase 2 Features
- Multi-traveler trip planning
- Group booking coordination
- Travel insurance integration
- Visa and documentation assistance

### Phase 3 Features
- AI-powered itinerary optimization
- Real-time travel alerts and updates
- Social features and trip sharing
- Integration with calendar and email

### Advanced Integrations
- Car rental booking (via Skyscanner)
- Activity and tour booking
- Travel photography services
- Local transportation booking

## Analytics & Performance

### Key Metrics
- Trip completion rate
- Booking conversion rate
- Average trip value
- User engagement time
- Revenue per user

### Performance Monitoring
- API response times
- Search result relevance
- User satisfaction scores
- Technical error rates

## Support & Documentation

### User Support
- In-app help and tutorials
- FAQ and troubleshooting guides
- Email support for booking issues
- Partner customer service integration

### Developer Documentation
- API integration guides
- Component documentation
- Testing procedures
- Deployment instructions
