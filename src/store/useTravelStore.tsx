import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type {
  TravelSearchParams,
  FlightOption,
  HotelOption,
  RestaurantOption,
  TripItinerary
} from '../lib/types';
import {
  searchFlights,
  searchHotels,
  searchRestaurants,
  getTravelRecommendations,
  parseTravelQuery
} from '../lib/travelApi';

export interface TravelMessage {
  id: string;
  from: 'user' | 'assistant';
  text: string;
  timestamp: number;
  tripId?: string;
  searchResults?: {
    flights?: FlightOption[];
    hotels?: HotelOption[];
    restaurants?: RestaurantOption[];
  };
}

interface TravelState {
  // Chat messages
  messages: TravelMessage[];
  isLoading: boolean;

  // Search state
  currentSearch: TravelSearchParams;
  searchResults: {
    flights: FlightOption[];
    hotels: HotelOption[];
    restaurants: RestaurantOption[];
  };

  // Trip management
  trips: TripItinerary[];
  currentTrip: TripItinerary | null;

  // Actions
  addMessage: (message: Omit<TravelMessage, 'id' | 'timestamp'>) => void;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;

  // Search actions
  updateSearchParams: (params: Partial<TravelSearchParams>) => void;
  searchFlights: (params?: TravelSearchParams) => Promise<void>;
  searchHotels: (params?: TravelSearchParams) => Promise<void>;
  searchRestaurants: (location: string, date?: string) => Promise<void>;

  // Trip actions
  createTrip: (title: string, destination: string) => string;
  updateTrip: (tripId: string, updates: Partial<TripItinerary>) => void;
  deleteTrip: (tripId: string) => void;
  setCurrentTrip: (tripId: string | null) => void;
  addFlightToTrip: (tripId: string, flight: FlightOption) => void;
  addHotelToTrip: (tripId: string, hotel: HotelOption) => void;
  addRestaurantToTrip: (tripId: string, restaurant: RestaurantOption) => void;

  // Utility actions
  setLoading: (loading: boolean) => void;
  getPinnedTrips: () => TripItinerary[];
}

export const useTravelStore = create<TravelState>()(
  persist(
    (set, get) => ({
      // Initial state
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
      currentTrip: null,

      // Message actions
      addMessage: (message) => {
        const newMessage: TravelMessage = {
          ...message,
          id: nanoid(),
          timestamp: Date.now()
        };
        set(state => ({
          messages: [...state.messages, newMessage]
        }));
      },

      sendMessage: async (text: string) => {
        const { addMessage, setLoading } = get();

        // Add user message
        addMessage({ from: 'user', text });
        setLoading(true);

        try {
          // Check for network connectivity
          if (!navigator.onLine) {
            throw new Error('No internet connection. Please check your network and try again.');
          }

          // Parse the travel query
          const searchParams = parseTravelQuery(text);

          // Update search parameters if we found any
          if (Object.keys(searchParams).length > 0) {
            set(state => ({
              currentSearch: { ...state.currentSearch, ...searchParams }
            }));
          }

          // Determine what type of search to perform based on the query
          let responseText = '';
          let searchResults: any = {};

          if (text.toLowerCase().includes('flight') || searchParams.origin || searchParams.destination) {
            const flightResponse = await searchFlights(searchParams);
            if (flightResponse.success) {
              searchResults.flights = flightResponse.data;
              responseText = `I found ${flightResponse.data.length} flight options for you. Here are the best matches:`;

              // Update search results
              set(state => ({
                searchResults: { ...state.searchResults, flights: flightResponse.data }
              }));
            } else {
              responseText = flightResponse.error || 'Sorry, I couldn\'t find any flights for your search.';
            }
          } else if (text.toLowerCase().includes('hotel') || text.toLowerCase().includes('stay')) {
            const hotelResponse = await searchHotels(searchParams);
            if (hotelResponse.success) {
              searchResults.hotels = hotelResponse.data;
              responseText = `I found ${hotelResponse.data.length} hotel options for you:`;

              set(state => ({
                searchResults: { ...state.searchResults, hotels: hotelResponse.data }
              }));
            } else {
              responseText = hotelResponse.error || 'Sorry, I couldn\'t find any hotels for your search.';
            }
          } else if (text.toLowerCase().includes('restaurant') || text.toLowerCase().includes('dining')) {
            const location = searchParams.destination || 'your destination';
            const restaurantResponse = await searchRestaurants(location);
            if (restaurantResponse.success) {
              searchResults.restaurants = restaurantResponse.data;
              responseText = `I found ${restaurantResponse.data.length} restaurant options in ${location}:`;

              set(state => ({
                searchResults: { ...state.searchResults, restaurants: restaurantResponse.data }
              }));
            } else {
              responseText = restaurantResponse.error || 'Sorry, I couldn\'t find any restaurants for your search.';
            }
          } else {
            // General travel advice or recommendations
            const recommendationsResponse = await getTravelRecommendations(text);
            if (recommendationsResponse.success) {
              const { destinations, activities, tips } = recommendationsResponse.data;
              responseText = `Here are some travel recommendations:\n\n**Popular Destinations:** ${destinations.join(', ')}\n\n**Suggested Activities:** ${activities.join(', ')}\n\n**Travel Tips:** ${tips.join('. ')}`;
            } else {
              responseText = 'I\'d be happy to help you plan your trip! You can ask me about flights, hotels, restaurants, or general travel advice.';
            }
          }

          // Add assistant response
          addMessage({
            from: 'assistant',
            text: responseText,
            searchResults: Object.keys(searchResults).length > 0 ? searchResults : undefined
          });

        } catch (error) {
          console.error('Error processing travel query:', error);
          addMessage({
            from: 'assistant',
            text: 'Sorry, I encountered an error while processing your request. Please try again.'
          });
        } finally {
          setLoading(false);
        }
      },

      clearMessages: () => set({ messages: [] }),

      // Search actions
      updateSearchParams: (params) => {
        set(state => ({
          currentSearch: { ...state.currentSearch, ...params }
        }));
      },

      searchFlights: async (params) => {
        const { setLoading, currentSearch } = get();
        setLoading(true);

        try {
          const searchParams = params || currentSearch;
          const response = await searchFlights(searchParams);

          if (response.success) {
            set(state => ({
              searchResults: { ...state.searchResults, flights: response.data }
            }));
          }
        } catch (error) {
          console.error('Flight search error:', error);
        } finally {
          setLoading(false);
        }
      },

      searchHotels: async (params) => {
        const { setLoading, currentSearch } = get();
        setLoading(true);

        try {
          const searchParams = params || currentSearch;
          const response = await searchHotels(searchParams);

          if (response.success) {
            set(state => ({
              searchResults: { ...state.searchResults, hotels: response.data }
            }));
          }
        } catch (error) {
          console.error('Hotel search error:', error);
        } finally {
          setLoading(false);
        }
      },

      searchRestaurants: async (location, date) => {
        const { setLoading } = get();
        setLoading(true);

        try {
          const response = await searchRestaurants(location, date);

          if (response.success) {
            set(state => ({
              searchResults: { ...state.searchResults, restaurants: response.data }
            }));
          }
        } catch (error) {
          console.error('Restaurant search error:', error);
        } finally {
          setLoading(false);
        }
      },

      // Trip management actions
      createTrip: (title, destination) => {
        const tripId = nanoid();
        const newTrip: TripItinerary = {
          id: tripId,
          title,
          destination,
          startDate: '',
          endDate: '',
          flights: [],
          hotels: [],
          restaurants: [],
          totalCost: 0,
          currency: 'USD',
          status: 'planning',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        set(state => ({
          trips: [...state.trips, newTrip],
          currentTrip: newTrip
        }));

        return tripId;
      },

      updateTrip: (tripId, updates) => {
        set(state => ({
          trips: state.trips.map(trip =>
            trip.id === tripId
              ? { ...trip, ...updates, updatedAt: new Date().toISOString() }
              : trip
          ),
          currentTrip: state.currentTrip?.id === tripId
            ? { ...state.currentTrip, ...updates, updatedAt: new Date().toISOString() }
            : state.currentTrip
        }));
      },

      deleteTrip: (tripId) => {
        set(state => ({
          trips: state.trips.filter(trip => trip.id !== tripId),
          currentTrip: state.currentTrip?.id === tripId ? null : state.currentTrip
        }));
      },

      setCurrentTrip: (tripId) => {
        const { trips } = get();
        const trip = tripId ? trips.find(t => t.id === tripId) || null : null;
        set({ currentTrip: trip });
      },

      addFlightToTrip: (tripId, flight) => {
        const { updateTrip, trips } = get();
        const trip = trips.find(t => t.id === tripId);
        if (trip) {
          const updatedFlights = [...trip.flights, flight];
          const totalCost = trip.totalCost + flight.price;
          updateTrip(tripId, { flights: updatedFlights, totalCost });
        }
      },

      addHotelToTrip: (tripId, hotel) => {
        const { updateTrip, trips } = get();
        const trip = trips.find(t => t.id === tripId);
        if (trip) {
          const updatedHotels = [...trip.hotels, hotel];
          const totalCost = trip.totalCost + hotel.price;
          updateTrip(tripId, { hotels: updatedHotels, totalCost });
        }
      },

      addRestaurantToTrip: (tripId, restaurant) => {
        const { updateTrip, trips } = get();
        const trip = trips.find(t => t.id === tripId);
        if (trip) {
          const updatedRestaurants = [...trip.restaurants, restaurant];
          updateTrip(tripId, { restaurants: updatedRestaurants });
        }
      },

      // Utility actions
      setLoading: (loading) => set({ isLoading: loading }),

      getPinnedTrips: () => {
        const { trips } = get();
        return trips.filter(trip => trip.status === 'planning').slice(0, 3);
      }
    }),
    {
      name: 'travel-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        trips: state.trips,
        currentTrip: state.currentTrip,
        messages: state.messages.slice(-50) // Keep only last 50 messages
      })
    }
  )
);
