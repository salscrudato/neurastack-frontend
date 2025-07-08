
import {
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    Box,
    Button,
    Fade,
    HStack,
    useColorModeValue,
} from '@chakra-ui/react';
import { useUpdateManager } from '../utils/updateManager';

export const UpdateNotification = () => {
  const {
    updateAvailable,
    isUpdating,
    handleUpdate,
    dismissUpdate,
    offlineReady
  } = useUpdateManager();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('blue.200', 'blue.600');

  // Show update notification when available
  if (updateAvailable) {
    return (
      <Fade in={updateAvailable}>
        <Box
          position="fixed"
          bottom="20px"
          right="20px"
          zIndex={9999}
          maxWidth="400px"
          bg={bgColor}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="lg"
          boxShadow="lg"
          p={4}
        >
          <Alert status="info" variant="subtle" borderRadius="md">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle fontSize="sm" mb={1}>
                Update Available!
              </AlertTitle>
              <AlertDescription fontSize="xs" mb={3}>
                A new version of NeuraStack is ready. Update now for the latest features and improvements.
              </AlertDescription>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={handleUpdate}
                  isLoading={isUpdating}
                  loadingText="Updating..."
                >
                  Update Now
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={dismissUpdate}
                  isDisabled={isUpdating}
                >
                  Later
                </Button>
              </HStack>
            </Box>
          </Alert>
        </Box>
      </Fade>
    );
  }

  // Show offline ready notification briefly
  if (offlineReady) {
    return (
      <Fade in={true}>
        <Box
          position="fixed"
          bottom="20px"
          right="20px"
          zIndex={9999}
          maxWidth="350px"
          bg={bgColor}
          border="1px solid"
          borderColor="green.200"
          borderRadius="lg"
          boxShadow="lg"
          p={4}
        >
          <Alert status="success" variant="subtle" borderRadius="md">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle fontSize="sm" mb={1}>
                Ready for Offline Use
              </AlertTitle>
              <AlertDescription fontSize="xs">
                NeuraStack is now cached and ready to work offline.
              </AlertDescription>
            </Box>
          </Alert>
        </Box>
      </Fade>
    );
  }

  return null;
};

export default UpdateNotification;
