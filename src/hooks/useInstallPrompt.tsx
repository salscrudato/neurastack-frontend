// src/hooks/useInstallPrompt.ts
import { useEffect, useState } from 'react';

// Define the missing BeforeInstallPromptEvent interface
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
  prompt(): Promise<void>;
}

export default function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: any) => {
      // Remove this line to fix the warning
      // e.preventDefault();
      setPromptEvent(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  return promptEvent; // call promptEvent.prompt() on a nice "Install neurastack" button
}
