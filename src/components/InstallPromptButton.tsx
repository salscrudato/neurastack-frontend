import React from 'react';

export default function InstallPromptButton() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<Event | null>(null);
  const [showButton, setShowButton] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: Event) => {
      // Don't prevent default here, as that's what's causing the warning
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);

    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);

  const handleClick = async () => {
    if (!deferredPrompt) return;
    // @ts-ignore - this is safe in modern browsers
    deferredPrompt.prompt();
    // @ts-ignore
    const result = await deferredPrompt.userChoice;
    console.log('Install choice:', result);
    setShowButton(false);
  };

  if (!showButton) return null;

  return (
    <button onClick={handleClick}>
      Install Neurastack
    </button>
  );
}
