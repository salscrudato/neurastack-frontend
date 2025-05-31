import {
  Box,
  Flex,
  Text,
  useColorModeValue,
  useToast,
  VStack,

  HStack,
  Badge,
  Button,
} from '@chakra-ui/react';
import { PiAirplaneBold, PiMapPinBold, PiCalendarBold } from 'react-icons/pi';
import { useState, useRef, useEffect } from 'react';
import { AppShell } from '../components/AppShell';
import { Message } from '../components/Message';
import { useTravelStore } from '../store/useTravelStore';
import TravelChatInput from '../components/TravelChatInput';
import FlightCard from '../components/FlightCard';
import HotelCard from '../components/HotelCard';
import RestaurantCard from '../components/RestaurantCard';
import TripSidebar from '../components/TripSidebar';

/* ------------------------------------------------------------------ */
/* ✈️  neuraplanner – AI‑powered trip planning (chat-style)          */
/* ------------------------------------------------------------------ */

export default function NeuraplannerPage() {
  const toast = useToast();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  // Travel store
  const {
    messages,
    isLoading,
    currentTrip,
    trips,
    sendMessage,
    createTrip,
    setCurrentTrip,
    addFlightToTrip,
    addHotelToTrip,
    addRestaurantToTrip,
  } = useTravelStore();

  // Colors
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle sending messages
  const handleSendMessage = async (prompt: string) => {
    if (!prompt.trim()) return;

    // Check for network connectivity
    if (!navigator.onLine) {
      toast({
        status: 'error',
        title: 'No internet connection',
        description: 'Please check your network and try again.',
        duration: 5000,
        isClosable: true
      });
      return;
    }

    try {
      await sendMessage(prompt);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        status: 'error',
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        duration: 5000,
        isClosable: true
      });
    }
  };

  // Handle adding items to trip
  const handleAddToTrip = (type: 'flight' | 'hotel' | 'restaurant', item: any) => {
    if (!currentTrip) {
      // Create a new trip if none exists
      const destination = item.destination || item.location || 'New Trip';
      const tripId = createTrip(`Trip to ${destination}`, destination);
      
      // Add the item to the new trip
      if (type === 'flight') addFlightToTrip(tripId, item);
      else if (type === 'hotel') addHotelToTrip(tripId, item);
      else if (type === 'restaurant') addRestaurantToTrip(tripId, item);
      
      toast({
        status: 'success',
        title: 'Added to new trip',
        description: `Created a new trip and added ${type}`,
        duration: 3000,
        isClosable: true
      });
    } else {
      // Add to existing trip
      if (type === 'flight') addFlightToTrip(currentTrip.id, item);
      else if (type === 'hotel') addHotelToTrip(currentTrip.id, item);
      else if (type === 'restaurant') addRestaurantToTrip(currentTrip.id, item);
      
      toast({
        status: 'success',
        title: 'Added to trip',
        description: `Added ${type} to ${currentTrip.title}`,
        duration: 3000,
        isClosable: true
      });
    }
  };

  // Render search results
  const renderSearchResults = (message: any) => {
    const { searchResults: results } = message;
    if (!results) return null;

    return (
      <VStack spacing={4} align="stretch" mt={4}>
        {/* Flight Results */}
        {results.flights && results.flights.length > 0 && (
          <VStack spacing={3} align="stretch">
            <Text fontSize="sm" fontWeight="semibold" color="gray.500">
              Flight Options
            </Text>
            {results.flights.map((flight: any) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                onBook={() => window.open(flight.bookingUrl, '_blank')}
                onAddToTrip={() => handleAddToTrip('flight', flight)}
              />
            ))}
          </VStack>
        )}

        {/* Hotel Results */}
        {results.hotels && results.hotels.length > 0 && (
          <VStack spacing={3} align="stretch">
            <Text fontSize="sm" fontWeight="semibold" color="gray.500">
              Hotel Options
            </Text>
            {results.hotels.map((hotel: any) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onBook={() => window.open(hotel.bookingUrl, '_blank')}
                onAddToTrip={() => handleAddToTrip('hotel', hotel)}
              />
            ))}
          </VStack>
        )}

        {/* Restaurant Results */}
        {results.restaurants && results.restaurants.length > 0 && (
          <VStack spacing={3} align="stretch">
            <Text fontSize="sm" fontWeight="semibold" color="gray.500">
              Restaurant Options
            </Text>
            {results.restaurants.map((restaurant: any) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onReserve={() => window.open(restaurant.reservationUrl, '_blank')}
                onAddToTrip={() => handleAddToTrip('restaurant', restaurant)}
              />
            ))}
          </VStack>
        )}
      </VStack>
    );
  };

  return (
    <AppShell>
      <Flex h="100%" bg={bgColor}>
        {/* Main Chat Area */}
        <Flex direction="column" flex="1" overflow="hidden">
          {/* Header with Trip Info */}
          {currentTrip && (
            <Box
              px={4}
              py={3}
              bg={cardBg}
              borderBottom="1px solid"
              borderColor={borderColor}
            >
              <HStack justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" fontWeight="semibold">
                    {currentTrip.title}
                  </Text>
                  <HStack spacing={4} fontSize="xs" color="gray.500">
                    <HStack spacing={1}>
                      <PiMapPinBold />
                      <Text>{currentTrip.destination}</Text>
                    </HStack>
                    <HStack spacing={1}>
                      <PiCalendarBold />
                      <Text>{currentTrip.status}</Text>
                    </HStack>
                    {currentTrip.totalCost > 0 && (
                      <Badge colorScheme="blue" size="sm">
                        ${currentTrip.totalCost}
                      </Badge>
                    )}
                  </HStack>
                </VStack>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowSidebar(true)}
                >
                  View Trip
                </Button>
              </HStack>
            </Box>
          )}

          {/* Messages Container */}
          <Box
            flex="1"
            overflowY="auto"
            px={{ base: 2, md: 3 }}
            py={{ base: 2, md: 3 }}
            pb={{ base: 4, md: 3 }}
          >
            {messages.length === 0 ? (
              // Hero section
              <Flex
                direction="column"
                align="center"
                justify="center"
                h="100%"
                textAlign="center"
                px={{ base: 4, md: 8 }}
                py={{ base: 8, md: 0 }}
              >
                <Box
                  p={6}
                  borderRadius="2xl"
                  bg={useColorModeValue('whiteAlpha.700', 'whiteAlpha.100')}
                  backdropFilter="blur(10px)"
                  border="1px solid"
                  borderColor={useColorModeValue('whiteAlpha.300', 'whiteAlpha.200')}
                  maxW="md"
                  w="full"
                >
                  <VStack spacing={4}>
                    <Box
                      p={4}
                      borderRadius="full"
                      bg={useColorModeValue('blue.50', 'blue.900')}
                    >
                      <PiAirplaneBold size={32} color="blue" />
                    </Box>
                    <VStack spacing={2}>
                      <Text fontSize="xl" fontWeight="bold">
                        Plan Your Perfect Trip
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Tell me where you want to go and I'll help you find flights, hotels, and restaurants
                      </Text>
                    </VStack>
                  </VStack>
                </Box>
              </Flex>
            ) : (
              // Messages
              <VStack spacing={{ base: 2, md: 3 }} align="stretch">
                {messages.map((message) => (
                  <Box key={message.id}>
                    <Message from={message.from}>
                      <Text fontSize={{ base: "sm", md: "md" }}>
                        {message.text}
                      </Text>
                    </Message>
                    {renderSearchResults(message)}
                  </Box>
                ))}
              </VStack>
            )}
            <div ref={bottomRef} />
          </Box>

          {/* Chat Input */}
          <TravelChatInput
            onSend={handleSendMessage}
            isLoading={isLoading}
            placeholder="Where would you like to go? (e.g., 'Find flights from NYC to LA')"
          />
        </Flex>

        {/* Trip Sidebar */}
        <TripSidebar
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
          trip={currentTrip}
          trips={trips}
          onSelectTrip={setCurrentTrip}
          onCreateTrip={() => {
            const tripId = createTrip('New Trip', 'Destination');
            setCurrentTrip(tripId);
            setShowSidebar(false);
          }}
        />
      </Flex>
    </AppShell>
  );
}
