import {
  Box,
  Flex,
  Text,
  Button,
  HStack,
  VStack,
  Badge,
  useColorModeValue,
  Icon,
  Divider,
} from '@chakra-ui/react';
import { PiAirplaneBold, PiClockBold, PiCurrencyDollarBold, PiPlusBold } from 'react-icons/pi';
import type { FlightOption } from '../lib/types';

interface FlightCardProps {
  flight: FlightOption;
  onBook: () => void;
  onAddToTrip: () => void;
  showAddToTrip?: boolean;
}

export default function FlightCard({
  flight,
  onBook,
  onAddToTrip,
  showAddToTrip = true
}: FlightCardProps) {
  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.900', 'gray.100');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  // Format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      p={4}
      transition="all 0.2s ease"
      _hover={{
        bg: hoverBg,
        transform: 'translateY(-1px)',
        boxShadow: useColorModeValue('md', 'dark-lg'),
      }}
    >
      <VStack spacing={4} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <HStack spacing={3}>
            <Box
              p={2}
              borderRadius="lg"
              bg={useColorModeValue('blue.50', 'blue.900')}
            >
              <Icon as={PiAirplaneBold} color="blue.500" boxSize={5} />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontSize="md" fontWeight="semibold" color={textColor}>
                {flight.airline}
              </Text>
              <Text fontSize="sm" color={subtextColor}>
                {flight.flightNumber}
              </Text>
            </VStack>
          </HStack>
          
          <VStack align="end" spacing={0}>
            <Text fontSize="xl" fontWeight="bold" color={textColor}>
              ${flight.price}
            </Text>
            <Text fontSize="xs" color={subtextColor}>
              {flight.currency}
            </Text>
          </VStack>
        </Flex>

        {/* Flight Details */}
        <Box>
          <Flex justify="space-between" align="center" mb={2}>
            <VStack align="start" spacing={1}>
              <Text fontSize="lg" fontWeight="bold" color={textColor}>
                {formatTime(flight.departureTime)}
              </Text>
              <Text fontSize="sm" color={subtextColor}>
                {flight.origin}
              </Text>
              <Text fontSize="xs" color={subtextColor}>
                {formatDate(flight.departureTime)}
              </Text>
            </VStack>

            <VStack spacing={1}>
              <HStack spacing={2} align="center">
                <Icon as={PiClockBold} color={subtextColor} boxSize={4} />
                <Text fontSize="sm" color={subtextColor}>
                  {flight.duration}
                </Text>
              </HStack>
              
              {flight.stops === 0 ? (
                <Badge colorScheme="green" size="sm">
                  Direct
                </Badge>
              ) : (
                <Badge colorScheme="orange" size="sm">
                  {flight.stops} stop{flight.stops > 1 ? 's' : ''}
                </Badge>
              )}
            </VStack>

            <VStack align="end" spacing={1}>
              <Text fontSize="lg" fontWeight="bold" color={textColor}>
                {formatTime(flight.arrivalTime)}
              </Text>
              <Text fontSize="sm" color={subtextColor}>
                {flight.destination}
              </Text>
              <Text fontSize="xs" color={subtextColor}>
                {formatDate(flight.arrivalTime)}
              </Text>
            </VStack>
          </Flex>

          {/* Cabin Class */}
          <HStack justify="center" mt={2}>
            <Badge
              colorScheme="blue"
              variant="subtle"
              textTransform="capitalize"
            >
              {flight.cabinClass}
            </Badge>
          </HStack>
        </Box>

        <Divider />

        {/* Actions */}
        <HStack spacing={3}>
          {showAddToTrip && (
            <Button
              leftIcon={<PiPlusBold />}
              variant="outline"
              size="sm"
              onClick={onAddToTrip}
              flex={1}
            >
              Add to Trip
            </Button>
          )}
          
          <Button
            leftIcon={<PiCurrencyDollarBold />}
            colorScheme="blue"
            size="sm"
            onClick={onBook}
            flex={1}
          >
            Book Now
          </Button>
        </HStack>

        {/* Booking Info */}
        <Box
          bg={useColorModeValue('green.50', 'green.900')}
          p={2}
          borderRadius="md"
          border="1px solid"
          borderColor={useColorModeValue('green.200', 'green.700')}
        >
          <Text fontSize="xs" color={useColorModeValue('green.700', 'green.300')} textAlign="center">
            ✓ No booking fees • Best price guaranteed
          </Text>
          <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} textAlign="center" mt={1}>
            Powered by TravelPayouts
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
