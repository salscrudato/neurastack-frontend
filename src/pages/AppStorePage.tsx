import {
  Box, Flex, IconButton, Text, VStack,
  useColorModeValue
} from '@chakra-ui/react';
import { PiXLight, PiCheckSquareOffsetBold, PiNewspaperLight } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';

export default function AppStorePage() {
  const navigate = useNavigate();
  const cardBg   = useColorModeValue('whiteAlpha.50','whiteAlpha.100');
  const cardFg   = useColorModeValue('gray.700','gray.200');   // unified dark‑grey for icons & text

  const Card = ({ icon, label, onClick, disabled=false }: any) => (
    <Flex
      as="button"
      direction="column"
      align="center"
      justify="center"
      gap={2}
      py={8}
      w="full"
      bg={cardBg}
      color={cardFg}
      opacity={disabled ? 0.4 : 1}
      _hover={!disabled ? { bg: useColorModeValue('whiteAlpha.300','whiteAlpha.200') } : {}}
      onClick={disabled ? undefined : onClick}>
      {icon}
      <Text fontWeight="semibold">{label}</Text>
    </Flex>
  );

  return (
    <Box h="100vh" bg={useColorModeValue('gray.50','gray.900')} pos="relative">
      {/* Close button */}
      <IconButton
        icon={<PiXLight size={20}/>}
        aria-label="Close"
        variant="ghost"
        color={cardFg}
        _hover={{ bg: useColorModeValue('whiteAlpha.300','whiteAlpha.200') }}
        pos="absolute"
        top={2} right={2}
        onClick={() => navigate(-1)}
      />

      <VStack spacing={4} w="full" pt={14} px={4}>
        <Card
          icon={<PiCheckSquareOffsetBold size={28}/>}
          label={<><span style={{fontStyle:'italic'}}>neura</span><span style={{fontWeight:600}}>task</span></>}
          onClick={() => navigate('/apps/neuratask')}
        />
        <Card
          icon={<PiNewspaperLight size={28}/>}
          label={<><span style={{fontStyle:'italic'}}>neura</span><span style={{fontWeight:600}}>news</span> (coming soon)</>}
          disabled
        />
      </VStack>
    </Box>
  );
}