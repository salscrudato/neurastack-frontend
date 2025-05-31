/**
 * Test Suite for neuraplanner
 * Comprehensive testing for travel planning functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTravelStore } from '../store/useTravelStore';
import { searchFlights, searchHotels, searchRestaurants, parseTravelQuery } from '../lib/travelApi';
import type { TravelSearchParams, FlightOption, HotelOption, RestaurantOption } from '../lib/types';

// Mock API functions
vi.mock('../lib/travelApi', () => ({
  searchFlights: vi.fn(),
  searchHotels: vi.fn(),
  searchRestaurants: vi.fn(),
  parseTravelQuery: vi.fn(),
  getTravelRecommendations: vi.fn()
}));

describe('Travel API Functions', () => {
  describe('parseTravelQuery', () => {
    it('should parse origin and destination from natural language', () => {
      const mockParseTravelQuery = vi.mocked(parseTravelQuery);
      mockParseTravelQuery.mockReturnValue({
        origin: 'NYC',
        destination: 'Paris',
        tripType: 'roundtrip',
        cabinClass: 'economy',
        passengers: 1
      });

      const result = parseTravelQuery('Find flights from NYC to Paris');
      
      expect(result.origin).toBe('NYC');
      expect(result.destination).toBe('Paris');
      expect(result.tripType).toBe('roundtrip');
    });

    it('should extract passenger count from query', () => {
      const mockParseTravelQuery = vi.mocked(parseTravelQuery);
      mockParseTravelQuery.mockReturnValue({
        origin: 'JFK',
        destination: 'LAX',
        passengers: 2,
        tripType: 'roundtrip',
        cabinClass: 'economy'
      });

      const result = parseTravelQuery('Find flights from JFK to LAX for 2 passengers');
      
      expect(result.passengers).toBe(2);
    });
  });

  describe('searchFlights', () => {
    it('should return flight options for valid search', async () => {
      const mockSearchFlights = vi.mocked(searchFlights);
      const mockFlights: FlightOption[] = [
        {
          id: 'flight-1',
          airline: 'Delta',
          flightNumber: 'DL123',
          origin: 'JFK',
          destination: 'LAX',
          departureTime: '2024-02-15T08:00:00Z',
          arrivalTime: '2024-02-15T11:30:00Z',
          duration: '5h 30m',
          price: 299,
          currency: 'USD',
          stops: 0,
          bookingUrl: 'https://example.com/book',
          cabinClass: 'economy'
        }
      ];

      mockSearchFlights.mockResolvedValue({
        success: true,
        data: mockFlights
      });

      const searchParams: TravelSearchParams = {
        origin: 'JFK',
        destination: 'LAX',
        departureDate: '2024-02-15',
        passengers: 1,
        tripType: 'roundtrip',
        cabinClass: 'economy'
      };

      const result = await searchFlights(searchParams);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].airline).toBe('Delta');
    });

    it('should handle API errors gracefully', async () => {
      const mockSearchFlights = vi.mocked(searchFlights);
      mockSearchFlights.mockResolvedValue({
        success: false,
        data: [],
        error: 'API Error: Failed to fetch flights'
      });

      const result = await searchFlights({});
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('API Error');
    });
  });

  describe('searchHotels', () => {
    it('should return hotel options for valid search', async () => {
      const mockSearchHotels = vi.mocked(searchHotels);
      const mockHotels: HotelOption[] = [
        {
          id: 'hotel-1',
          name: 'Test Hotel',
          location: 'Los Angeles, CA',
          rating: 4.5,
          price: 200,
          currency: 'USD',
          checkIn: '2024-02-15',
          checkOut: '2024-02-18',
          amenities: ['WiFi', 'Pool'],
          bookingUrl: 'https://example.com/book'
        }
      ];

      mockSearchHotels.mockResolvedValue({
        success: true,
        data: mockHotels
      });

      const result = await searchHotels({ destination: 'Los Angeles' });
      
      expect(result.success).toBe(true);
      expect(result.data[0].name).toBe('Test Hotel');
    });
  });

  describe('searchRestaurants', () => {
    it('should return restaurant options for valid location', async () => {
      const mockSearchRestaurants = vi.mocked(searchRestaurants);
      const mockRestaurants: RestaurantOption[] = [
        {
          id: 'restaurant-1',
          name: 'Test Restaurant',
          cuisine: 'Italian',
          location: 'Los Angeles, CA',
          rating: 4.7,
          priceRange: '$$$',
          availableTimes: ['6:00 PM', '7:00 PM'],
          reservationUrl: 'https://example.com/reserve'
        }
      ];

      mockSearchRestaurants.mockResolvedValue({
        success: true,
        data: mockRestaurants
      });

      const result = await searchRestaurants('Los Angeles');
      
      expect(result.success).toBe(true);
      expect(result.data[0].cuisine).toBe('Italian');
    });
  });
});

describe('Travel Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useTravelStore.setState({
      messages: [],
      isLoading: false,
      currentSearch: {
        tripType: 'roundtrip',
        cabinClass: 'economy',
        passengers: 1
      },
      searchResults: {
        flights: [],
        hotels: [],
        restaurants: []
      },
      trips: [],
      currentTrip: null
    });
  });

  describe('Message Management', () => {
    it('should add messages correctly', () => {
      const { result } = renderHook(() => useTravelStore());

      act(() => {
        result.current.addMessage({
          from: 'user',
          text: 'Find flights to Paris'
        });
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].text).toBe('Find flights to Paris');
      expect(result.current.messages[0].from).toBe('user');
    });

    it('should clear messages', () => {
      const { result } = renderHook(() => useTravelStore());

      act(() => {
        result.current.addMessage({ from: 'user', text: 'Test message' });
        result.current.clearMessages();
      });

      expect(result.current.messages).toHaveLength(0);
    });
  });

  describe('Trip Management', () => {
    it('should create a new trip', () => {
      const { result } = renderHook(() => useTravelStore());

      act(() => {
        const tripId = result.current.createTrip('Paris Trip', 'Paris, France');
        expect(tripId).toBeDefined();
      });

      expect(result.current.trips).toHaveLength(1);
      expect(result.current.trips[0].title).toBe('Paris Trip');
      expect(result.current.trips[0].destination).toBe('Paris, France');
      expect(result.current.currentTrip).toBe(result.current.trips[0]);
    });

    it('should add flight to trip', () => {
      const { result } = renderHook(() => useTravelStore());

      const mockFlight: FlightOption = {
        id: 'flight-1',
        airline: 'Delta',
        flightNumber: 'DL123',
        origin: 'JFK',
        destination: 'CDG',
        departureTime: '2024-02-15T08:00:00Z',
        arrivalTime: '2024-02-15T20:00:00Z',
        duration: '8h 00m',
        price: 599,
        currency: 'USD',
        stops: 0,
        bookingUrl: 'https://example.com/book',
        cabinClass: 'economy'
      };

      let tripId: string;

      act(() => {
        tripId = result.current.createTrip('Paris Trip', 'Paris, France');
        result.current.addFlightToTrip(tripId, mockFlight);
      });

      expect(result.current.currentTrip?.flights).toHaveLength(1);
      expect(result.current.currentTrip?.flights[0].airline).toBe('Delta');
      expect(result.current.currentTrip?.totalCost).toBe(599);
    });

    it('should add hotel to trip', () => {
      const { result } = renderHook(() => useTravelStore());

      const mockHotel: HotelOption = {
        id: 'hotel-1',
        name: 'Paris Hotel',
        location: 'Paris, France',
        rating: 4.5,
        price: 200,
        currency: 'USD',
        checkIn: '2024-02-15',
        checkOut: '2024-02-18',
        amenities: ['WiFi', 'Breakfast'],
        bookingUrl: 'https://example.com/book'
      };

      let tripId: string;

      act(() => {
        tripId = result.current.createTrip('Paris Trip', 'Paris, France');
        result.current.addHotelToTrip(tripId, mockHotel);
      });

      expect(result.current.currentTrip?.hotels).toHaveLength(1);
      expect(result.current.currentTrip?.hotels[0].name).toBe('Paris Hotel');
      expect(result.current.currentTrip?.totalCost).toBe(200);
    });

    it('should delete trip', () => {
      const { result } = renderHook(() => useTravelStore());

      let tripId: string;

      act(() => {
        tripId = result.current.createTrip('Test Trip', 'Test Destination');
        result.current.deleteTrip(tripId);
      });

      expect(result.current.trips).toHaveLength(0);
      expect(result.current.currentTrip).toBeNull();
    });
  });

  describe('Search Parameters', () => {
    it('should update search parameters', () => {
      const { result } = renderHook(() => useTravelStore());

      act(() => {
        result.current.updateSearchParams({
          origin: 'JFK',
          destination: 'LAX',
          passengers: 2,
          cabinClass: 'business'
        });
      });

      expect(result.current.currentSearch.origin).toBe('JFK');
      expect(result.current.currentSearch.destination).toBe('LAX');
      expect(result.current.currentSearch.passengers).toBe(2);
      expect(result.current.currentSearch.cabinClass).toBe('business');
    });
  });

  describe('Loading State', () => {
    it('should manage loading state correctly', () => {
      const { result } = renderHook(() => useTravelStore());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
});
