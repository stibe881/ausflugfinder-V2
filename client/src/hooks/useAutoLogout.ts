import { useEffect, useRef } from 'react';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const LOCALSTORAGE_KEY = 'ausflug_disable_auto_logout';

export const useAutoLogout = (onLogout: () => void, isAppInstalled: boolean) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoggedOutRef = useRef(false);

  // Check if user has disabled auto-logout
  const isAutoLogoutDisabled = () => {
    if (!isAppInstalled) return false;
    return localStorage.getItem(LOCALSTORAGE_KEY) === 'true';
  };

  // Reset the inactivity timer
  const resetTimer = () => {
    if (isAutoLogoutDisabled()) return;

    // Clear existing timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timer
    timeoutRef.current = setTimeout(() => {
      if (!isLoggedOutRef.current) {
        isLoggedOutRef.current = true;
        onLogout();
      }
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    if (isAutoLogoutDisabled()) return;

    // Listen for user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer, true);
    });

    // Initial timer
    resetTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer, true);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isAppInstalled]);

  return {
    isAutoLogoutDisabled,
    setAutoLogoutDisabled: (disabled: boolean) => {
      if (disabled) {
        localStorage.setItem(LOCALSTORAGE_KEY, 'true');
      } else {
        localStorage.removeItem(LOCALSTORAGE_KEY);
      }
    },
  };
};
