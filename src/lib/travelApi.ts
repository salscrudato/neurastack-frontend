/**
 * src/lib/travelApi.ts
 * ---------------------------------------------------------------------------
 * Travel API integration layer for neuraplanner
 * Integrates with TravelPayouts (Aviasales + Hotellook) APIs for real-time travel data
 * Uses affiliate/commission-based model with zero visible fees to users
 *
 * API Integration Strategy:
 * - TravelPayouts Aviasales API: Flight search with ~1% commission
 * - TravelPayouts Hotellook API: Hotel search with ~4% commission
 * - OpenTable API: Restaurant Reservations (Commission per booking)
 * - Fallback to mock data for development/demo purposes
 * ---------------------------------------------------------------------------
 */

import type {
  TravelSearchParams,
  FlightOption,
  HotelOption,
  RestaurantOption,
  TravelApiResponse
} from './types';

// TravelPayouts API Configuration
const TRAVELPAYOUTS_API_URL = 'https://api.travelpayouts.com';
const HOTELLOOK_API_URL = 'https://engine.hotellook.com/api/v2';
const AVIASALES_BOOKING_URL = 'https://www.aviasales.com';
const HOTELLOOK_BOOKING_URL = 'https://search.hotellook.com';

// TravelPayouts credentials
const TP_TOKEN = import.meta.env.VITE_TP_TOKEN || '1f2b23d7260c7fe41c095ed6bef08107';
const TP_MARKER = import.meta.env.VITE_TP_MARKER || '636389';
const TP_HOST = import.meta.env.VITE_TP_HOST || 'neurastack.com';

// Development mode flag
const IS_DEVELOPMENT = import.meta.env.DEV || !TP_TOKEN;

// Cache for API responses (simple in-memory cache)
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

/**
 * Simple cache implementation with TTL
 */
function getCachedData(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCachedData(key: string, data: any, ttlMinutes: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMinutes * 60 * 1000
  });
}

/**
 * Build affiliate flight booking link
 */
export function buildFlightLink(origin: string, destination: string, departDate: string, returnDate?: string): string {
  const params = new URLSearchParams({
    marker: TP_MARKER,
    origin_iata: origin,
    destination_iata: destination,
    depart_date: departDate,
    ...(returnDate && { return_date: returnDate })
  });

  return `${AVIASALES_BOOKING_URL}/?${params.toString()}`;
}

/**
 * Build affiliate hotel booking link
 */
export function buildHotelLink(hotelId: string, checkIn: string, checkOut: string, guests: number = 1): string {
  const params = new URLSearchParams({
    marker: TP_MARKER,
    hotelId,
    checkIn,
    checkOut,
    adults: guests.toString()
  });

  return `${HOTELLOOK_BOOKING_URL}/?${params.toString()}`;
}

/**
 * Convert IATA airport code to city code for TravelPayouts API
 */
function getAirportCode(location: string): string {
  // Common airport mappings for NYC market
  const airportMappings: Record<string, string> = {
    'NYC': 'NYC', 'JFK': 'NYC', 'LGA': 'NYC', 'EWR': 'NYC',
    'LAX': 'LAX', 'SFO': 'SFO', 'ORD': 'CHI', 'MIA': 'MIA',
    'BOS': 'BOS', 'DCA': 'WAS', 'IAD': 'WAS', 'BWI': 'WAS',
    'ATL': 'ATL', 'DEN': 'DEN', 'SEA': 'SEA', 'LAS': 'LAS',
    'PHX': 'PHX', 'DFW': 'DFW', 'IAH': 'HOU', 'MSP': 'MSP'
  };

  const code = location.toUpperCase();
  return airportMappings[code] || code;
}

// Mock data for development - includes TravelPayouts affiliate links
const MOCK_FLIGHTS: FlightOption[] = [
  {
    id: 'flight-1',
    airline: 'Delta Air Lines',
    flightNumber: 'DL 123',
    origin: 'JFK',
    destination: 'LAX',
    departureTime: '2024-02-15T08:00:00Z',
    arrivalTime: '2024-02-15T11:30:00Z',
    duration: '5h 30m',
    price: 299,
    currency: 'USD',
    stops: 0,
    bookingUrl: buildFlightLink('JFK', 'LAX', '2024-02-15'),
    cabinClass: 'economy'
  },
  {
    id: 'flight-2',
    airline: 'American Airlines',
    flightNumber: 'AA 456',
    origin: 'JFK',
    destination: 'LAX',
    departureTime: '2024-02-15T14:00:00Z',
    arrivalTime: '2024-02-15T17:45:00Z',
    duration: '5h 45m',
    price: 349,
    currency: 'USD',
    stops: 0,
    bookingUrl: buildFlightLink('JFK', 'LAX', '2024-02-15'),
    cabinClass: 'economy'
  },
  {
    id: 'flight-3',
    airline: 'JetBlue Airways',
    flightNumber: 'B6 789',
    origin: 'JFK',
    destination: 'SFO',
    departureTime: '2024-02-16T09:30:00Z',
    arrivalTime: '2024-02-16T13:15:00Z',
    duration: '6h 45m',
    price: 279,
    currency: 'USD',
    stops: 0,
    bookingUrl: buildFlightLink('JFK', 'SFO', '2024-02-16'),
    cabinClass: 'economy'
  }
];

const MOCK_HOTELS: HotelOption[] = [
  {
    id: 'hotel-1',
    name: 'The Beverly Hills Hotel',
    location: 'Beverly Hills, CA',
    rating: 4.8,
    price: 450,
    currency: 'USD',
    checkIn: '2024-02-15',
    checkOut: '2024-02-18',
    amenities: ['Pool', 'Spa', 'Gym', 'Restaurant', 'WiFi'],
    bookingUrl: buildHotelLink('hotel-1', '2024-02-15', '2024-02-18'),
    description: 'Iconic luxury hotel in the heart of Beverly Hills'
  },
  {
    id: 'hotel-2',
    name: 'Santa Monica Beach Hotel',
    location: 'Santa Monica, CA',
    rating: 4.5,
    price: 280,
    currency: 'USD',
    checkIn: '2024-02-15',
    checkOut: '2024-02-18',
    amenities: ['Beach Access', 'Pool', 'Restaurant', 'WiFi'],
    bookingUrl: buildHotelLink('hotel-2', '2024-02-15', '2024-02-18'),
    description: 'Beachfront hotel with stunning ocean views'
  },
  {
    id: 'hotel-3',
    name: 'Times Square Boutique Hotel',
    location: 'Manhattan, NY',
    rating: 4.3,
    price: 320,
    currency: 'USD',
    checkIn: '2024-02-15',
    checkOut: '2024-02-18',
    amenities: ['Gym', 'Business Center', 'WiFi', 'Concierge'],
    bookingUrl: buildHotelLink('hotel-3', '2024-02-15', '2024-02-18'),
    description: 'Modern hotel in the heart of Times Square'
  }
];

const MOCK_RESTAURANTS: RestaurantOption[] = [
  {
    id: 'restaurant-1',
    name: 'Nobu Malibu',
    cuisine: 'Japanese',
    location: 'Malibu, CA',
    rating: 4.7,
    priceRange: '$$$',
    availableTimes: ['6:00 PM', '7:00 PM', '8:00 PM'],
    reservationUrl: 'https://opentable.com/restaurant-1',
    description: 'World-renowned Japanese cuisine with ocean views'
  },
  {
    id: 'restaurant-2',
    name: 'Guelaguetza',
    cuisine: 'Mexican',
    location: 'Los Angeles, CA',
    rating: 4.6,
    priceRange: '$$',
    availableTimes: ['6:30 PM', '7:30 PM', '8:30 PM'],
    reservationUrl: 'https://opentable.com/restaurant-2',
    description: 'Authentic Oaxacan cuisine in the heart of LA'
  }
];

/**
 * Search for flights based on travel parameters using TravelPayouts Aviasales API
 */
export async function searchFlights(
  params: TravelSearchParams
): Promise<TravelApiResponse<FlightOption[]>> {
  try {
    // Use mock data in development or if no real origin/destination provided
    if (IS_DEVELOPMENT || !params.origin || !params.destination) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        success: true,
        data: MOCK_FLIGHTS.filter(flight =>
          !params.origin || flight.origin.toLowerCase().includes(params.origin.toLowerCase())
        )
      };
    }

    // Prepare search parameters for TravelPayouts API
    const origin = getAirportCode(params.origin);
    const destination = getAirportCode(params.destination);
    const departDate = params.departureDate || new Date().toISOString().split('T')[0];
    const returnDate = params.returnDate;

    // Create cache key
    const cacheKey = `flights:${origin}:${destination}:${departDate}:${returnDate || 'oneway'}`;

    // Check cache first (15 minute TTL)
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return { success: true, data: cachedData };
    }

    // Call TravelPayouts API for latest prices
    const apiUrl = `${TRAVELPAYOUTS_API_URL}/v2/prices/latest`;
    const searchParams = new URLSearchParams({
      origin,
      destination,
      depart_date: departDate,
      token: TP_TOKEN,
      currency: 'USD',
      market: 'us', // NYC market focus
      limit: '10'
    });

    if (returnDate) {
      searchParams.append('return_date', returnDate);
    }

    const response = await fetch(`${apiUrl}?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': `${TP_HOST}/neuraplanner`
      }
    });

    if (!response.ok) {
      throw new Error(`TravelPayouts API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Transform TravelPayouts response to our format
    const flights: FlightOption[] = (data.data || []).map((flight: any, index: number) => {
      const departureTime = new Date(`${flight.depart_date}T${flight.departure_at || '08:00:00'}`).toISOString();
      const arrivalTime = new Date(`${flight.return_date || flight.depart_date}T${flight.return_at || '12:00:00'}`).toISOString();

      return {
        id: `tp-flight-${index}`,
        airline: flight.airline || 'Various Airlines',
        flightNumber: `${flight.airline || 'XX'} ${Math.floor(Math.random() * 1000)}`,
        origin: flight.origin,
        destination: flight.destination,
        departureTime,
        arrivalTime,
        duration: flight.duration ? `${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m` : '6h 00m',
        price: Math.round(flight.value || flight.price || 299),
        currency: 'USD',
        stops: flight.transfers || 0,
        bookingUrl: buildFlightLink(origin, destination, departDate, returnDate),
        cabinClass: params.cabinClass || 'economy'
      };
    });

    // Cache the results for 15 minutes
    setCachedData(cacheKey, flights, 15);

    return {
      success: true,
      data: flights
    };

  } catch (error) {
    console.error('Flight search error:', error);

    // Fallback to mock data on error
    return {
      success: true,
      data: MOCK_FLIGHTS.slice(0, 3),
      error: 'Using sample data. Live flight search temporarily unavailable.'
    };
  }
}

/**
 * Search for hotels based on travel parameters using TravelPayouts Hotellook API
 */
export async function searchHotels(
  params: TravelSearchParams
): Promise<TravelApiResponse<HotelOption[]>> {
  try {
    // Use mock data in development or if no destination provided
    if (IS_DEVELOPMENT || !params.destination) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      return {
        success: true,
        data: MOCK_HOTELS.filter(hotel =>
          !params.destination || hotel.location.toLowerCase().includes(params.destination.toLowerCase())
        )
      };
    }

    const checkIn = params.departureDate || new Date().toISOString().split('T')[0];
    const checkOut = params.returnDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const guests = params.passengers || 1;

    // Create cache key
    const cacheKey = `hotels:${params.destination}:${checkIn}:${checkOut}:${guests}`;

    // Check cache first (6 hour TTL)
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return { success: true, data: cachedData };
    }

    // Call TravelPayouts Hotellook API
    const apiUrl = `${HOTELLOOK_API_URL}/cache.json`;
    const searchParams = new URLSearchParams({
      location: params.destination,
      checkIn,
      checkOut,
      adults: guests.toString(),
      token: TP_TOKEN,
      currency: 'USD',
      limit: '10'
    });

    const response = await fetch(`${apiUrl}?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': `${TP_HOST}/neuraplanner`
      }
    });

    if (!response.ok) {
      throw new Error(`Hotellook API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Transform Hotellook response to our format
    const hotels: HotelOption[] = (data.results || []).slice(0, 10).map((hotel: any, index: number) => ({
      id: `tp-hotel-${hotel.id || index}`,
      name: hotel.name || `Hotel ${index + 1}`,
      location: hotel.location || params.destination || 'Unknown Location',
      rating: hotel.stars || hotel.rating || 4.0,
      price: Math.round(hotel.price || hotel.priceAvg || 150),
      currency: 'USD',
      checkIn,
      checkOut,
      amenities: hotel.amenities || ['WiFi', 'Parking', 'Restaurant'],
      imageUrl: hotel.photoUrl || hotel.image,
      bookingUrl: buildHotelLink(hotel.id?.toString() || `hotel-${index}`, checkIn, checkOut, guests),
      description: hotel.description || `Comfortable accommodation in ${params.destination}`
    }));

    // Cache the results for 6 hours
    setCachedData(cacheKey, hotels, 360);

    return {
      success: true,
      data: hotels
    };

  } catch (error) {
    console.error('Hotel search error:', error);

    // Fallback to mock data on error
    return {
      success: true,
      data: MOCK_HOTELS.slice(0, 3),
      error: 'Using sample data. Live hotel search temporarily unavailable.'
    };
  }
}

/**
 * Search for restaurants based on location
 */
export async function searchRestaurants(
  location: string
): Promise<TravelApiResponse<RestaurantOption[]>> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // In production, this would call OpenTable API
    return {
      success: true,
      data: MOCK_RESTAURANTS.filter(restaurant =>
        restaurant.location.toLowerCase().includes(location.toLowerCase())
      )
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: 'Failed to search restaurants. Please try again.'
    };
  }
}

/**
 * Get travel recommendations based on AI analysis
 */
export async function getTravelRecommendations(
  _prompt: string
): Promise<TravelApiResponse<{
  destinations: string[];
  activities: string[];
  tips: string[];
}>> {
  try {
    // This would integrate with the existing AI API
    // For now, return mock recommendations
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      data: {
        destinations: ['Los Angeles', 'San Francisco', 'New York'],
        activities: ['Beach activities', 'City tours', 'Fine dining'],
        tips: ['Book flights early for better prices', 'Consider off-season travel', 'Check visa requirements']
      }
    };
  } catch (error) {
    return {
      success: false,
      data: { destinations: [], activities: [], tips: [] },
      error: 'Failed to get recommendations. Please try again.'
    };
  }
}

/**
 * Parse natural language travel query to extract search parameters
 */
export function parseTravelQuery(query: string): TravelSearchParams {
  const params: TravelSearchParams = {};

  // Simple regex patterns for extracting travel info
  const originMatch = query.match(/from\s+([a-zA-Z\s]+?)(?:\s+to|\s+$)/i);
  const destinationMatch = query.match(/to\s+([a-zA-Z\s]+?)(?:\s+on|\s+in|\s+$)/i);
  // const dateMatch = query.match(/(?:on|in)\s+([a-zA-Z0-9\s,]+)/i);
  const passengersMatch = query.match(/(\d+)\s+(?:passenger|person|people)/i);

  if (originMatch) params.origin = originMatch[1].trim();
  if (destinationMatch) params.destination = destinationMatch[1].trim();
  if (passengersMatch) params.passengers = parseInt(passengersMatch[1]);

  // Default values
  params.tripType = 'roundtrip';
  params.cabinClass = 'economy';
  params.passengers = params.passengers || 1;

  return params;
}
