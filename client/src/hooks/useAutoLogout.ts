import { useEffect, useRef, useCallback } from 'react';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const LOCALSTORAGE_KEY = 'ausflug_disable_auto_logout';

export const useAutoLogout = (onLogout: () => void, shouldEnable: boolean) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoggedOutRef = useRef(false);

  // Check if user has disabled auto-logout for installed apps
  const isAutoLogoutDisabled = useCallback(() => {
    return localStorage.getItem(LOCALSTORAGE_KEY) === 'true';
  }, []);

  // Reset the inactivity timer
  const resetTimer = useCallback(() => {
    // Don't reset if auto-logout is disabled
    if (isAutoLogoutDisabled()) return;
    // Don't reset if already logged out
    if (isLoggedOutRef.current) return;

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
  }, [onLogout, isAutoLogoutDisabled]);

  useEffect(() => {
    // Only enable auto-logout if shouldEnable is true
    if (!shouldEnable) {
      // Clean up timers when disabled
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    // Don't enable if auto-logout is disabled by user
    if (isAutoLogoutDisabled()) {
      return;
    }

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
  }, [shouldEnable, resetTimer, isAutoLogoutDisabled]);

  return {
    isAutoLogoutDisabled,
    setAutoLogoutDisabled: (disabled: boolean) => {
      if (disabled) {
        localStorage.setItem(LOCALSTORAGE_KEY, 'true');
      } else {
        localStorage.removeItem(LOCALSTORAGE_KEY);
      }
      // Reset logout state when toggling
      isLoggedOutRef.current = false;
    },
  };
};
