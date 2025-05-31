import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Badge,
  Icon,
  Divider,
  useColorModeValue,
  IconButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import {
  PiPlusBold,
  PiAirplaneBold,
  PiBuildingsBold,
  PiCookingPotBold,
  PiMapPinBold,
  PiCalendarBold,
  PiCurrencyDollarBold,
  PiTrashBold,
} from 'react-icons/pi';
import type { TripItinerary } from '../lib/types';

interface TripSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripItinerary | null;
  trips: TripItinerary[];
  onSelectTrip: (tripId: string) => void;
  onCreateTrip: () => void;
  onDeleteTrip?: (tripId: string) => void;
}

export default function TripSidebar({
  isOpen,
  onClose,
  trip,
  trips,
  onSelectTrip,
  onCreateTrip,
  onDeleteTrip
}: TripSidebarProps) {
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.900', 'gray.100');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'blue';
      case 'booked':
        return 'green';
      case 'completed':
        return 'gray';
      default:
        return 'gray';
    }
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent bg={bgColor}>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px" borderColor={borderColor}>
          <HStack justify="space-between">
            <Text>Trip Planner</Text>
            <Button
              size="sm"
              leftIcon={<PiPlusBold />}
              colorScheme="blue"
              onClick={onCreateTrip}
            >
              New Trip
            </Button>
          </HStack>
        </DrawerHeader>

        <DrawerBody p={0}>
          <VStack spacing={0} align="stretch" h="100%">
            {/* Current Trip Details */}
            {trip && (
              <Box p={4} borderBottomWidth="1px" borderColor={borderColor}>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={1}>
                      <Text fontSize="lg" fontWeight="bold" color={textColor}>
                        {trip.title}
                      </Text>
                      <HStack spacing={2}>
                        <Icon as={PiMapPinBold} color={subtextColor} boxSize={4} />
                        <Text fontSize="sm" color={subtextColor}>
                          {trip.destination}
                        </Text>
                      </HStack>
                    </VStack>
                    <Badge colorScheme={getStatusColor(trip.status)} textTransform="capitalize">
                      {trip.status}
                    </Badge>
                  </HStack>

                  {/* Trip Summary */}
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color={subtextColor}>Dates:</Text>
                      <Text fontSize="sm" color={textColor}>
                        {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                      </Text>
                    </HStack>

                    {trip.totalCost > 0 && (
                      <HStack justify="space-between">
                        <Text fontSize="sm" color={subtextColor}>Total Cost:</Text>
                        <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                          ${trip.totalCost} {trip.currency}
                        </Text>
                      </HStack>
                    )}
                  </VStack>

                  {/* Trip Items */}
                  <Accordion allowMultiple defaultIndex={[0, 1, 2]}>
                    {/* Flights */}
                    <AccordionItem border="none">
                      <AccordionButton px={0} py={2}>
                        <Box flex="1" textAlign="left">
                          <HStack>
                            <Icon as={PiAirplaneBold} color="blue.500" boxSize={4} />
                            <Text fontSize="sm" fontWeight="semibold">
                              Flights ({trip.flights.length})
                            </Text>
                          </HStack>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel px={0} py={2}>
                        {trip.flights.length === 0 ? (
                          <Text fontSize="sm" color={subtextColor}>
                            No flights added yet
                          </Text>
                        ) : (
                          <VStack spacing={2} align="stretch">
                            {trip.flights.map((flight, index) => (
                              <Box
                                key={index}
                                p={2}
                                bg={useColorModeValue('gray.50', 'gray.700')}
                                borderRadius="md"
                              >
                                <Text fontSize="sm" fontWeight="semibold">
                                  {flight.airline} {flight.flightNumber}
                                </Text>
                                <Text fontSize="xs" color={subtextColor}>
                                  {flight.origin} → {flight.destination}
                                </Text>
                                <Text fontSize="xs" color={subtextColor}>
                                  ${flight.price} {flight.currency}
                                </Text>
                              </Box>
                            ))}
                          </VStack>
                        )}
                      </AccordionPanel>
                    </AccordionItem>

                    {/* Hotels */}
                    <AccordionItem border="none">
                      <AccordionButton px={0} py={2}>
                        <Box flex="1" textAlign="left">
                          <HStack>
                            <Icon as={PiBuildingsBold} color="green.500" boxSize={4} />
                            <Text fontSize="sm" fontWeight="semibold">
                              Hotels ({trip.hotels.length})
                            </Text>
                          </HStack>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel px={0} py={2}>
                        {trip.hotels.length === 0 ? (
                          <Text fontSize="sm" color={subtextColor}>
                            No hotels added yet
                          </Text>
                        ) : (
                          <VStack spacing={2} align="stretch">
                            {trip.hotels.map((hotel, index) => (
                              <Box
                                key={index}
                                p={2}
                                bg={useColorModeValue('gray.50', 'gray.700')}
                                borderRadius="md"
                              >
                                <Text fontSize="sm" fontWeight="semibold">
                                  {hotel.name}
                                </Text>
                                <Text fontSize="xs" color={subtextColor}>
                                  {hotel.location}
                                </Text>
                                <Text fontSize="xs" color={subtextColor}>
                                  ${hotel.price}/night
                                </Text>
                              </Box>
                            ))}
                          </VStack>
                        )}
                      </AccordionPanel>
                    </AccordionItem>

                    {/* Restaurants */}
                    <AccordionItem border="none">
                      <AccordionButton px={0} py={2}>
                        <Box flex="1" textAlign="left">
                          <HStack>
                            <Icon as={PiCookingPotBold} color="orange.500" boxSize={4} />
                            <Text fontSize="sm" fontWeight="semibold">
                              Restaurants ({trip.restaurants.length})
                            </Text>
                          </HStack>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel px={0} py={2}>
                        {trip.restaurants.length === 0 ? (
                          <Text fontSize="sm" color={subtextColor}>
                            No restaurants added yet
                          </Text>
                        ) : (
                          <VStack spacing={2} align="stretch">
                            {trip.restaurants.map((restaurant, index) => (
                              <Box
                                key={index}
                                p={2}
                                bg={useColorModeValue('gray.50', 'gray.700')}
                                borderRadius="md"
                              >
                                <Text fontSize="sm" fontWeight="semibold">
                                  {restaurant.name}
                                </Text>
                                <Text fontSize="xs" color={subtextColor}>
                                  {restaurant.cuisine} • {restaurant.priceRange}
                                </Text>
                                <Text fontSize="xs" color={subtextColor}>
                                  {restaurant.location}
                                </Text>
                              </Box>
                            ))}
                          </VStack>
                        )}
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                </VStack>
              </Box>
            )}

            {/* All Trips List */}
            <Box flex={1} p={4}>
              <Text fontSize="md" fontWeight="semibold" color={textColor} mb={3}>
                All Trips ({trips.length})
              </Text>

              {trips.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Text fontSize="sm" color={subtextColor} mb={4}>
                    No trips yet. Create your first trip to get started!
                  </Text>
                  <Button
                    leftIcon={<PiPlusBold />}
                    colorScheme="blue"
                    onClick={onCreateTrip}
                  >
                    Create Trip
                  </Button>
                </Box>
              ) : (
                <VStack spacing={3} align="stretch">
                  {trips.map((tripItem) => (
                    <Box
                      key={tripItem.id}
                      p={3}
                      border="1px solid"
                      borderRadius="lg"
                      cursor="pointer"
                      transition="all 0.2s ease"
                      _hover={{
                        bg: useColorModeValue('gray.50', 'gray.700'),
                        borderColor: useColorModeValue('blue.300', 'blue.600'),
                      }}
                      bg={trip?.id === tripItem.id ? useColorModeValue('blue.50', 'blue.900') : 'transparent'}
                      borderColor={trip?.id === tripItem.id ? 'blue.500' : borderColor}
                      onClick={() => onSelectTrip(tripItem.id)}
                    >
                      <HStack justify="space-between" align="start">
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                            {tripItem.title}
                          </Text>
                          <Text fontSize="xs" color={subtextColor}>
                            {tripItem.destination}
                          </Text>
                          <HStack spacing={2}>
                            <Badge size="sm" colorScheme={getStatusColor(tripItem.status)}>
                              {tripItem.status}
                            </Badge>
                            {tripItem.totalCost > 0 && (
                              <Badge size="sm" variant="outline">
                                ${tripItem.totalCost}
                              </Badge>
                            )}
                          </HStack>
                        </VStack>

                        {onDeleteTrip && (
                          <IconButton
                            aria-label="Delete trip"
                            icon={<PiTrashBold />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTrip(tripItem.id);
                            }}
                          />
                        )}
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
