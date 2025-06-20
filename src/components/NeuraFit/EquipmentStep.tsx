import {
    Box,
    Button,
    Icon,
    SimpleGrid,
    Text,
    VStack
} from '@chakra-ui/react';
import { useState } from 'react';
import equipmentOptions, { type EquipmentOption } from '../../constants/equipmentOptions';
import { useFitnessStore } from '../../store/useFitnessStore';
import NavigationButtons from './NavigationButtons';

interface EquipmentStepProps {
  onNext: () => void;
  onPrev: () => void;
  isEditingFromDashboard?: boolean;
}

export default function EquipmentStep({ onNext, onPrev, isEditingFromDashboard = false }: EquipmentStepProps) {
  const { profile, updateProfile } = useFitnessStore();

  // Updated color scheme to match new design system (light mode only as per user preferences)
  const textColor = '#0F172A'; // text.primary
  const subtextColor = '#64748B'; // text.tertiary
  const cardBg = '#FFFFFF'; // surface.primary
  const borderColor = '#E2E8F0'; // border.medium
  const hoverBg = '#F8FAFC'; // surface.secondary

  // State to track last changed equipment for aria-live announcement
  const [lastChanged, setLastChanged] = useState<string | null>(null);

  // Handle toggling equipment selection with exclusive logic for "Body Weight"
  const handleEquipmentToggle = (equipmentCode: string) => {
    const currentEquipment = profile.equipment || [];
    const isSelected = currentEquipment.includes(equipmentCode);

    let newEquipment: string[];
    if (isSelected) {
      newEquipment = currentEquipment.filter(eq => eq !== equipmentCode);
    } else {
      if (equipmentCode === 'BW') {
        newEquipment = ['BW'];
      } else {
        newEquipment = currentEquipment.filter(eq => eq !== 'BW');
        newEquipment = [...newEquipment, equipmentCode];
      }
    }
    updateProfile({ equipment: newEquipment });
    setLastChanged(equipmentOptions.find((opt: EquipmentOption) => opt.code === equipmentCode)?.label || null);
  };

  // Check if equipment is selected by code
  const isEquipmentSelected = (equipmentCode: string) => {
    return profile.equipment?.includes(equipmentCode) || false;
  };

  const canProceed = profile.equipment && profile.equipment.length > 0;

  // Accessibility label id prefix
  const labelIdPrefix = "equipment-label-";

  // Compose announcement text for screen readers
  const selectedCount = profile.equipment?.length || 0;
  const announcement = lastChanged
    ? `${selectedCount} item${selectedCount !== 1 ? 's' : ''} selected. Last changed: ${lastChanged}.`
    : selectedCount > 0
      ? `${selectedCount} item${selectedCount !== 1 ? 's' : ''} selected.`
      : 'No equipment selected.';

  return (
    <VStack
      spacing={{ base: 3, md: 4 }}
      align="stretch"
      w="100%"
      h="100%"
      justify="space-between"
      p={{ base: 3, md: 4 }}
      overflow="hidden"
    >
      {/* Compact Header */}
      <VStack spacing={2} textAlign="center" flex="0 0 auto">
        <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={textColor}>
          What equipment do you have?
        </Text>
        <Text fontSize={{ base: "sm", md: "md" }} color={subtextColor}>
          Select all available equipment
        </Text>
      </VStack>

      {/* Aria-live region for announcing selection changes */}
      <Text
        aria-live="polite"
        role="status"
        srOnly
        mt={-4}
        mb={2}
        id="equipment-selection-status"
      >
        {announcement}
      </Text>

      {/* Mobile-Optimized Equipment Grid - 4 rows × 2 columns */}
      <Box flex="1 1 auto" display="flex" flexDirection="column" justifyContent="center" overflow="hidden">
        <SimpleGrid
          columns={2}
          spacing={{ base: 3, md: 4 }}
          w="100%"
          maxW="400px"
          mx="auto"
          aria-describedby="equipment-selection-status"
        >
          {equipmentOptions.map((equipment: EquipmentOption) => {
            const isSelected = isEquipmentSelected(equipment.code);
            const labelId = `${labelIdPrefix}${equipment.code}`;

            return (
              <Button
                key={equipment.code}
                w="100%"
                h={{ base: "85px", md: "95px" }}
                bg={isSelected ? `${equipment.color}.100` : cardBg}
                border="2px solid"
                borderColor={isSelected ? `${equipment.color}.500` : borderColor}
                borderRadius="xl"
                onClick={() => handleEquipmentToggle(equipment.code)}
                _hover={{
                  bg: isSelected
                    ? `${equipment.color}.200`
                    : hoverBg,
                  transform: 'translateY(-1px)',
                  boxShadow: 'md',
                }}
                _active={{
                  transform: 'translateY(0)',
                }}
                transition="all 0.2s ease"
                variant="ghost"
                flexDirection="column"
                p={{ base: 2, md: 3 }}
                role="checkbox"
                aria-checked={isSelected}
                aria-labelledby={labelId}
                data-cy={`equipment-card-${equipment.code}`}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <VStack spacing={{ base: 1.5, md: 2 }}>
                  <Icon
                    as={equipment.icon}
                    boxSize={{ base: 6, md: 7 }}
                    color={isSelected ? `${equipment.color}.500` : 'gray.400'}
                  />
                  <Text
                    id={labelId}
                    fontSize={{ base: "xs", md: "sm" }}
                    fontWeight="semibold"
                    color={textColor}
                    textAlign="center"
                    lineHeight="1.2"
                    noOfLines={2}
                    wordBreak="break-word"
                    style={{ hyphens: 'auto' }}
                  >
                    {equipment.label}
                  </Text>
                </VStack>
              </Button>
            );
          })}
        </SimpleGrid>
      </Box>

      {/* Fixed Navigation */}
      <Box flex="0 0 auto" w="100%">
        <NavigationButtons
          onBack={onPrev}
          onNext={onNext}
          canProceed={canProceed}
          nextLabel={isEditingFromDashboard ? "Save" : "Continue"}
          backLabel={isEditingFromDashboard ? "Back to Dashboard" : "Back"}
        />
      </Box>
    </VStack>
  );
}
