import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Switch,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Button,
  useColorModeValue,
  Icon,
  Divider,
  Alert,
  AlertIcon,
  AlertDescription
} from '@chakra-ui/react';
import { Volume2, Mic, Settings } from 'lucide-react';
import { useVoiceCoaching } from '../../hooks/useVoiceCoaching';

interface VoiceCoachingSettingsProps {
  onClose?: () => void;
}

export const VoiceCoachingSettings: React.FC<VoiceCoachingSettingsProps> = ({ onClose }) => {
  const {
    isEnabled,
    isSupported,
    isSpeaking,
    voices,
    options,
    speak,
    updateOptions,
    stop
  } = useVoiceCoaching();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleTestVoice = () => {
    speak("This is a test of your voice coaching settings. How does this sound?", 'high');
  };

  const handleVoiceChange = (voiceIndex: string) => {
    const selectedVoice = voices[parseInt(voiceIndex)];
    updateOptions({ voice: selectedVoice });
  };

  if (!isSupported) {
    return (
      <Box p={6} bg={bgColor} borderRadius="lg" border="1px" borderColor={borderColor}>
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <AlertDescription>
            Voice coaching is not supported in your browser. Please use a modern browser like Chrome, Safari, or Firefox.
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={6} bg={bgColor} borderRadius="lg" border="1px" borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack spacing={3}>
          <Icon as={Mic} color="blue.500" boxSize={6} />
          <Text fontSize="xl" fontWeight="bold">
            Voice Coaching Settings
          </Text>
        </HStack>

        <Divider />

        {/* Enable/Disable Toggle */}
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Text fontWeight="medium">Enable Voice Coaching</Text>
            <Text fontSize="sm" color="gray.500">
              Get audio guidance during your workouts
            </Text>
          </VStack>
          <Switch
            isChecked={isEnabled}
            onChange={(e) => updateOptions({ enabled: e.target.checked })}
            colorScheme="blue"
            size="lg"
          />
        </HStack>

        {isEnabled && (
          <>
            <Divider />

            {/* Voice Selection */}
            <VStack align="stretch" spacing={3}>
              <Text fontWeight="medium">Voice Selection</Text>
              <Select
                value={voices.findIndex(v => v === options.voice)}
                onChange={(e) => handleVoiceChange(e.target.value)}
                placeholder="Select a voice"
              >
                {voices.map((voice, index) => (
                  <option key={index} value={index}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </Select>
            </VStack>

            {/* Speech Rate */}
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between">
                <Text fontWeight="medium">Speech Rate</Text>
                <Text fontSize="sm" color="gray.500">
                  {options.rate?.toFixed(1)}x
                </Text>
              </HStack>
              <Slider
                value={options.rate || 1.0}
                onChange={(value) => updateOptions({ rate: value })}
                min={0.5}
                max={2.0}
                step={0.1}
                colorScheme="blue"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <HStack justify="space-between" fontSize="xs" color="gray.500">
                <Text>Slower</Text>
                <Text>Faster</Text>
              </HStack>
            </VStack>

            {/* Pitch */}
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between">
                <Text fontWeight="medium">Pitch</Text>
                <Text fontSize="sm" color="gray.500">
                  {options.pitch?.toFixed(1)}
                </Text>
              </HStack>
              <Slider
                value={options.pitch || 1.0}
                onChange={(value) => updateOptions({ pitch: value })}
                min={0.5}
                max={2.0}
                step={0.1}
                colorScheme="blue"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <HStack justify="space-between" fontSize="xs" color="gray.500">
                <Text>Lower</Text>
                <Text>Higher</Text>
              </HStack>
            </VStack>

            {/* Volume */}
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between">
                <Text fontWeight="medium">Volume</Text>
                <Text fontSize="sm" color="gray.500">
                  {Math.round((options.volume || 0.8) * 100)}%
                </Text>
              </HStack>
              <Slider
                value={options.volume || 0.8}
                onChange={(value) => updateOptions({ volume: value })}
                min={0.1}
                max={1.0}
                step={0.1}
                colorScheme="blue"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <HStack justify="space-between" fontSize="xs" color="gray.500">
                <Text>Quiet</Text>
                <Text>Loud</Text>
              </HStack>
            </VStack>

            <Divider />

            {/* Test Controls */}
            <VStack spacing={3}>
              <HStack spacing={3} width="100%">
                <Button
                  leftIcon={<Icon as={Volume2} />}
                  onClick={handleTestVoice}
                  isDisabled={isSpeaking}
                  colorScheme="blue"
                  variant="outline"
                  flex={1}
                >
                  Test Voice
                </Button>
                <Button
                  onClick={stop}
                  isDisabled={!isSpeaking}
                  colorScheme="red"
                  variant="outline"
                  flex={1}
                >
                  Stop
                </Button>
              </HStack>
              
              {isSpeaking && (
                <Text fontSize="sm" color="blue.500" textAlign="center">
                  Speaking...
                </Text>
              )}
            </VStack>

            {/* Information */}
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <AlertDescription fontSize="sm">
                Voice coaching will provide exercise instructions, motivational cues, and workout progress updates during your sessions.
              </AlertDescription>
            </Alert>
          </>
        )}

        {/* Close Button */}
        {onClose && (
          <>
            <Divider />
            <Button onClick={onClose} colorScheme="blue" size="lg">
              Save Settings
            </Button>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default VoiceCoachingSettings;
