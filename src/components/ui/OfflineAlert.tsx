import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OfflineAlert = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showAlert) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div className={`flex items-center p-4 rounded-lg shadow-lg ${
          isOnline ? 'bg-success-500 text-white' : 'bg-warning-500 text-white'
        }`}>
          {isOnline ? (
            <>
              <Wifi className="h-5 w-5 mr-2" />
              <span>You're back online!</span>
            </>
          ) : (
            <>
              <WifiOff className="h-5 w-5 mr-2" />
              <span>You're currently offline. Some features may be unavailable.</span>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OfflineAlert;