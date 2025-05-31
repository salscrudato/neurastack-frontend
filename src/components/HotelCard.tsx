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
  Wrap,
  WrapItem,
  Image,
} from '@chakra-ui/react';
import { 
  PiBuildingsBold, 
  PiStarFill, 
  PiMapPinBold, 
  PiCalendarBold,
  PiPlusBold,
  PiCurrencyDollarBold 
} from 'react-icons/pi';
import type { HotelOption } from '../lib/types';

interface HotelCardProps {
  hotel: HotelOption;
  onBook: () => void;
  onAddToTrip: () => void;
  showAddToTrip?: boolean;
}

export default function HotelCard({
  hotel,
  onBook,
  onAddToTrip,
  showAddToTrip = true
}: HotelCardProps) {
  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.900', 'gray.100');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate nights
  const calculateNights = () => {
    const checkIn = new Date(hotel.checkIn);
    const checkOut = new Date(hotel.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const nights = calculateNights();

  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      overflow="hidden"
      transition="all 0.2s ease"
      _hover={{
        bg: hoverBg,
        transform: 'translateY(-1px)',
        boxShadow: useColorModeValue('md', 'dark-lg'),
      }}
    >
      {/* Hotel Image */}
      {hotel.imageUrl && (
        <Image
          src={hotel.imageUrl}
          alt={hotel.name}
          h="150px"
          w="100%"
          objectFit="cover"
          fallback={
            <Box
              h="150px"
              bg={useColorModeValue('gray.100', 'gray.700')}
              display="flex"
              align="center"
              justify="center"
            >
              <Icon as={PiBuildingsBold} boxSize={12} color={subtextColor} />
            </Box>
          }
        />
      )}

      <Box p={4}>
        <VStack spacing={4} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="start">
            <VStack align="start" spacing={1} flex={1}>
              <Text fontSize="lg" fontWeight="bold" color={textColor} noOfLines={1}>
                {hotel.name}
              </Text>
              
              <HStack spacing={2}>
                <Icon as={PiMapPinBold} color={subtextColor} boxSize={4} />
                <Text fontSize="sm" color={subtextColor} noOfLines={1}>
                  {hotel.location}
                </Text>
              </HStack>

              <HStack spacing={2}>
                <HStack spacing={1}>
                  <Icon as={PiStarFill} color="yellow.400" boxSize={4} />
                  <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                    {hotel.rating}
                  </Text>
                </HStack>
                <Text fontSize="sm" color={subtextColor}>
                  ({Math.floor(hotel.rating * 100)} reviews)
                </Text>
              </HStack>
            </VStack>
            
            <VStack align="end" spacing={0}>
              <Text fontSize="xl" fontWeight="bold" color={textColor}>
                ${hotel.price}
              </Text>
              <Text fontSize="xs" color={subtextColor}>
                per night
              </Text>
            </VStack>
          </Flex>

          {/* Stay Details */}
          <Box>
            <HStack spacing={4} mb={3}>
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color={subtextColor} textTransform="uppercase">
                  Check-in
                </Text>
                <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                  {formatDate(hotel.checkIn)}
                </Text>
              </VStack>

              <Icon as={PiCalendarBold} color={subtextColor} boxSize={4} />

              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color={subtextColor} textTransform="uppercase">
                  Check-out
                </Text>
                <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                  {formatDate(hotel.checkOut)}
                </Text>
              </VStack>

              <Badge colorScheme="blue" variant="subtle">
                {nights} night{nights > 1 ? 's' : ''}
              </Badge>
            </HStack>

            {/* Total Cost */}
            <Box
              bg={useColorModeValue('blue.50', 'blue.900')}
              p={2}
              borderRadius="md"
              mb={3}
            >
              <HStack justify="space-between">
                <Text fontSize="sm" color={useColorModeValue('blue.700', 'blue.300')}>
                  Total for {nights} night{nights > 1 ? 's' : ''}:
                </Text>
                <Text fontSize="lg" fontWeight="bold" color={useColorModeValue('blue.700', 'blue.300')}>
                  ${hotel.price * nights}
                </Text>
              </HStack>
            </Box>
          </Box>

          {/* Amenities */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={2}>
                Amenities
              </Text>
              <Wrap spacing={1}>
                {hotel.amenities.slice(0, 5).map((amenity, index) => (
                  <WrapItem key={index}>
                    <Badge
                      size="sm"
                      variant="outline"
                      colorScheme="gray"
                    >
                      {amenity}
                    </Badge>
                  </WrapItem>
                ))}
                {hotel.amenities.length > 5 && (
                  <WrapItem>
                    <Badge size="sm" variant="outline" colorScheme="blue">
                      +{hotel.amenities.length - 5} more
                    </Badge>
                  </WrapItem>
                )}
              </Wrap>
            </Box>
          )}

          {/* Description */}
          {hotel.description && (
            <Text fontSize="sm" color={subtextColor} noOfLines={2}>
              {hotel.description}
            </Text>
          )}

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
              ✓ Free cancellation • No booking fees
            </Text>
            <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} textAlign="center" mt={1}>
              Powered by TravelPayouts
            </Text>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}
