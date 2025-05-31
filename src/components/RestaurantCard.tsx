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
  Select,
} from '@chakra-ui/react';
import { 
  PiCookingPotBold, 
  PiStarFill, 
  PiMapPinBold, 
  PiClockBold,
  PiPlusBold,
  PiCalendarCheckBold 
} from 'react-icons/pi';
import type { RestaurantOption } from '../lib/types';
import { useState } from 'react';

interface RestaurantCardProps {
  restaurant: RestaurantOption;
  onReserve: () => void;
  onAddToTrip: () => void;
  showAddToTrip?: boolean;
}

export default function RestaurantCard({
  restaurant,
  onReserve,
  onAddToTrip,
  showAddToTrip = true
}: RestaurantCardProps) {
  const [selectedTime, setSelectedTime] = useState(restaurant.availableTimes[0] || '');

  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.900', 'gray.100');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  // Price range colors
  const getPriceRangeColor = (priceRange: string) => {
    switch (priceRange) {
      case '$':
        return 'green';
      case '$$':
        return 'yellow';
      case '$$$':
        return 'orange';
      case '$$$$':
        return 'red';
      default:
        return 'gray';
    }
  };

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
      {/* Restaurant Image */}
      {restaurant.imageUrl && (
        <Image
          src={restaurant.imageUrl}
          alt={restaurant.name}
          h="120px"
          w="100%"
          objectFit="cover"
          fallback={
            <Box
              h="120px"
              bg={useColorModeValue('gray.100', 'gray.700')}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={PiCookingPotBold} boxSize={10} color={subtextColor} />
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
                {restaurant.name}
              </Text>
              
              <HStack spacing={2}>
                <Badge
                  colorScheme="purple"
                  variant="subtle"
                  textTransform="capitalize"
                >
                  {restaurant.cuisine}
                </Badge>
                <Badge
                  colorScheme={getPriceRangeColor(restaurant.priceRange)}
                  variant="outline"
                >
                  {restaurant.priceRange}
                </Badge>
              </HStack>

              <HStack spacing={2}>
                <Icon as={PiMapPinBold} color={subtextColor} boxSize={4} />
                <Text fontSize="sm" color={subtextColor} noOfLines={1}>
                  {restaurant.location}
                </Text>
              </HStack>
            </VStack>
            
            <VStack align="end" spacing={1}>
              <HStack spacing={1}>
                <Icon as={PiStarFill} color="yellow.400" boxSize={4} />
                <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                  {restaurant.rating}
                </Text>
              </HStack>
              <Text fontSize="xs" color={subtextColor}>
                ({Math.floor(restaurant.rating * 100)} reviews)
              </Text>
            </VStack>
          </Flex>

          {/* Description */}
          {restaurant.description && (
            <Text fontSize="sm" color={subtextColor} noOfLines={2}>
              {restaurant.description}
            </Text>
          )}

          {/* Available Times */}
          {restaurant.availableTimes && restaurant.availableTimes.length > 0 && (
            <Box>
              <HStack spacing={3} mb={2}>
                <Icon as={PiClockBold} color={subtextColor} boxSize={4} />
                <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                  Available Times
                </Text>
              </HStack>
              
              <Wrap spacing={2}>
                {restaurant.availableTimes.map((time, index) => (
                  <WrapItem key={index}>
                    <Button
                      size="sm"
                      variant={selectedTime === time ? "solid" : "outline"}
                      colorScheme={selectedTime === time ? "blue" : "gray"}
                      onClick={() => setSelectedTime(time)}
                      fontSize="xs"
                    >
                      {time}
                    </Button>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>
          )}

          <Divider />

          {/* Actions */}
          <VStack spacing={3}>
            {/* Time Selection for Reservation */}
            {restaurant.availableTimes && restaurant.availableTimes.length > 1 && (
              <Box w="100%">
                <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={2}>
                  Select Time for Reservation
                </Text>
                <Select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  size="sm"
                  placeholder="Choose a time"
                >
                  {restaurant.availableTimes.map((time, index) => (
                    <option key={index} value={time}>
                      {time}
                    </option>
                  ))}
                </Select>
              </Box>
            )}

            <HStack spacing={3} w="100%">
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
                leftIcon={<PiCalendarCheckBold />}
                colorScheme="blue"
                size="sm"
                onClick={onReserve}
                flex={1}
                isDisabled={!selectedTime}
              >
                Reserve {selectedTime && `at ${selectedTime}`}
              </Button>
            </HStack>
          </VStack>

          {/* Booking Info */}
          <Box
            bg={useColorModeValue('green.50', 'green.900')}
            p={2}
            borderRadius="md"
            border="1px solid"
            borderColor={useColorModeValue('green.200', 'green.700')}
          >
            <Text fontSize="xs" color={useColorModeValue('green.700', 'green.300')} textAlign="center">
              ✓ Free reservations • No booking fees
            </Text>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}
