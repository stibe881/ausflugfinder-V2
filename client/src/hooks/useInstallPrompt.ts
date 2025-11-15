import { useEffect, useState } from 'react';

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const useInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [showInstallPromptDialog, setShowInstallPromptDialog] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('✓ App läuft bereits im Standalone-Modus');
      setIsAppInstalled(true);
      return;
    }

    console.log('→ Warte auf beforeinstallprompt Event...');

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('✓ beforeinstallprompt event fired - Install Button wird sichtbar');
      const promptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      setShowInstallPromptDialog(true); // Show dialog when prompt is available
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      console.log('✓ App erfolgreich installiert');
      setIsAppInstalled(true);
      setShowInstallPromptDialog(false);
      setInstallPrompt(null);
    };

    // Log wenn Installation abgelehnt wird
    const handleBeforeInstallPromptError = () => {
      console.warn('⚠ beforeinstallprompt Event wurde nicht ausgelöst - Die App ist möglicherweise bereits installiert oder erfüllt nicht die PWA-Anforderungen');
      setShowInstallPromptDialog(true); // Show dialog even if prompt is not available, to give instructions
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Timeout nach 5s ein Fehler-Log ausgeben, falls Event nicht augelöst wurde
    const timeoutId = setTimeout(handleBeforeInstallPromptError, 5000);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      try {
        console.log('→ Zeige Install-Prompt...');
        await installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        console.log(`✓ User response to the install prompt: ${outcome}`);

        if (outcome === 'accepted') {
          console.log('✓ Installation akzeptiert');
          setIsAppInstalled(true);
        } else {
          console.log('→ Installation abgelehnt');
        }
      } catch (error) {
        console.error('✗ Install prompt failed:', error);
      }
    } else {
      console.warn('⚠ Kein beforeinstallprompt Event verfügbar. Benutzer muss manuelle Anleitung befolgen.');
      // Here we might just dismiss the dialog and rely on user to follow instructions in the dialog
    }
    setShowInstallPromptDialog(false); // Always close dialog after attempt
    setInstallPrompt(null);
  };

  const handleDismissInstallPromptDialog = () => {
    setShowInstallPromptDialog(false);
  };

  const showInstallPromptInstructions = () => {
    setShowInstallPromptDialog(true);
  };

  return {
    isAppInstalled,
    showInstallPromptDialog,
    showInstallPromptInstructions,
    handleInstallClick,
    handleDismissInstallPromptDialog,
  };
};
