// src/components/AddToHomeButton.tsx
import { Button, SlideFade } from "@chakra-ui/react";
import { useState } from "react";
import useInstallPrompt from "../hooks/useInstallPrompt";

export default function AddToHomeButton() {
  const promptEvent = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  // show only if the event exists *and* user hasn't dismissed
  if (!promptEvent || dismissed) return null;

  const install = async () => {
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;           // 'accepted' | 'dismissed'
    if (outcome !== "accepted") setDismissed(true);             // hide if user said no
  };

  return (
    <SlideFade in>
      <Button
        pos="fixed"
        bottom={6}
        right={6}
        size="lg"
        colorScheme="blue"
        borderRadius="full"
        shadow="lg"
        onClick={install}
      >
        🚀 Install neurastack
      </Button>
    </SlideFade>
  );
}