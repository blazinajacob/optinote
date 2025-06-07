import { useState, useEffect } from 'react';

interface PWAStatus {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  installPrompt: any;
}

export function usePWA() {
  const [status, setStatus] = useState<PWAStatus>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    installPrompt: null,
  });

  useEffect(() => {
    // Check if app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    
    // Update installed status
    if (isAppInstalled) {
      setStatus(prev => ({ ...prev, isInstalled: true }));
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setStatus(prev => ({ 
        ...prev, 
        isInstallable: true,
        installPrompt: e
      }));
    };

    // Listen for online/offline events
    const handleOnlineStatus = () => {
      setStatus(prev => ({ ...prev, isOnline: navigator.onLine }));
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  const promptInstall = async () => {
    if (!status.installPrompt) return;

    // Show the install prompt
    status.installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await status.installPrompt.userChoice;
    
    // Reset the install prompt
    setStatus(prev => ({ 
      ...prev, 
      isInstallable: false,
      installPrompt: null,
      isInstalled: outcome === 'accepted'
    }));
  };

  return { 
    ...status,
    promptInstall
  };
}