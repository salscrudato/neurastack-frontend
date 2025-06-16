import { useState } from 'react';
import {
  VStack,
  Text,
  Button,
  Icon,
  Wrap,
  WrapItem,
  Badge,
} from '@chakra-ui/react';
import { useFitnessStore } from '../../store/useFitnessStore';
import equipmentOptions, { type EquipmentOption } from '../../constants/equipmentOptions';
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
    <VStack spacing={4} align="stretch" w="100%">
      {/* Header */}
      <VStack spacing={2} textAlign="center" mb={2}>
        <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={textColor}>
          What equipment do you have?
        </Text>
        <Text fontSize={{ base: "sm", md: "md" }} color={subtextColor}>
          Select all available equipment to personalize your workouts
        </Text>
        {selectedCount > 0 && (
          <Badge colorScheme="blue" variant="subtle" mt={1}>
            {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
          </Badge>
        )}
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

      {/* Equipment grid */}
      <Wrap spacing={{ base: 2, md: 3 }} justify="center" aria-describedby="equipment-selection-status">
        {equipmentOptions.map((equipment: EquipmentOption) => {
          const isSelected = isEquipmentSelected(equipment.code);
          const labelId = `${labelIdPrefix}${equipment.code}`;

          return (
            <WrapItem key={equipment.code}>
              <Button
                w={{ base: "130px", md: "150px" }}
                h={{ base: "100px", md: "110px" }}
                bg={isSelected ? `${equipment.color}.100` : cardBg}
                border="2px solid"
                borderColor={isSelected ? `${equipment.color}.500` : borderColor}
                borderRadius="xl"
                onClick={() => handleEquipmentToggle(equipment.code)}
                _hover={{
                  bg: isSelected
                    ? `${equipment.color}.200`
                    : hoverBg,
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg',
                }}
                _active={{
                  transform: 'translateY(0)',
                }}
                transition="all 0.2s ease"
                variant="ghost"
                flexDirection="column"
                p={4}
                role="checkbox"
                aria-checked={isSelected}
                aria-labelledby={labelId}
                data-cy={`equipment-card-${equipment.code}`}
              >
                <VStack spacing={2}>
                  <Icon
                    as={equipment.icon}
                    boxSize={8}
                    color={isSelected ? `${equipment.color}.500` : 'gray.400'}
                  />
                  <Text
                    id={labelId}
                    fontSize="sm"
                    fontWeight="semibold"
                    color={textColor}
                    textAlign="center"
                    lineHeight="short"
                  >
                    {equipment.label}
                  </Text>
                </VStack>
              </Button>
            </WrapItem>
          );
        })}
      </Wrap>

      {/* Navigation buttons */}
      <NavigationButtons
        onBack={onPrev}
        onNext={onNext}
        canProceed={canProceed}
        nextLabel={isEditingFromDashboard ? "Save" : "Continue"}
        backLabel={isEditingFromDashboard ? "Back to Dashboard" : "Back"}
      />
    </VStack>
  );
}
