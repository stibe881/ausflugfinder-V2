/**
 * Location Hook
 * Handles geolocation tracking for proximity-based notifications
 * Supports background location tracking when enabled
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { usePushNotifications } from './usePushNotifications';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

export interface LocationState {
  coords: LocationCoords | null;
  isTracking: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useLocation = () => {
  const { updateLocation, settings, startLocationTracking } = usePushNotifications();
  const [locationState, setLocationState] = useState<LocationState>({
    coords: null,
    isTracking: false,
    isLoading: false,
    error: null,
  });

  const trackingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopTrackingRef = useRef<(() => void) | null>(null);

  /**
   * Request user's current location
   */
  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationState((prev) => ({
        ...prev,
        error: 'Geolocation not supported by browser',
      }));
      return null;
    }

    setLocationState((prev) => ({ ...prev, isLoading: true, error: null }));

    return new Promise<LocationCoords | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const coords: LocationCoords = {
            latitude,
            longitude,
            accuracy,
            timestamp: Date.now(),
          };

          setLocationState((prev) => ({
            ...prev,
            coords,
            isLoading: false,
            error: null,
          }));

          console.log(
            `✓ Location obtained: ${latitude.toFixed(4)}, ${longitude.toFixed(
              4
            )} (accuracy: ${accuracy}m)`
          );

          // Send to backend
          updateLocation(latitude, longitude, accuracy);
          resolve(coords);
        },
        (error) => {
          let errorMessage = 'Unknown geolocation error';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }

          console.error(`✗ Geolocation error: ${errorMessage}`);
          setLocationState((prev) => ({
            ...prev,
            isLoading: false,
            error: errorMessage,
          }));

          resolve(null);
        },
        {
          enableHighAccuracy: true, // Use GPS instead of IP
          timeout: 10000,
          maximumAge: 0, // Don't use cached position
        }
      );
    });
  }, [updateLocation]);

  /**
   * Start continuous location tracking
   * Default interval: 60 seconds (configurable)
   */
  const startTracking = useCallback(
    async (intervalMs = 60000) => {
      if (locationState.isTracking) {
        console.warn('⚠ Location tracking already active');
        return false;
      }

      console.log(
        `→ Starting location tracking (interval: ${intervalMs / 1000}s)`
      );

      setLocationState((prev) => ({
        ...prev,
        isTracking: true,
        error: null,
      }));

      // Get location immediately
      await requestLocation();

      // Set up recurring location updates
      trackingIntervalRef.current = setInterval(() => {
        requestLocation();
      }, intervalMs);

      // Also try to use background location tracking if available
      if ('BackgroundSync' in window && 'serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await registration.sync.register('location-sync');
          console.log('✓ Background location sync registered');
        } catch (err) {
          console.warn('⚠ Background sync not available:', err);
        }
      }

      return true;
    },
    [locationState.isTracking, requestLocation]
  );

  /**
   * Stop location tracking
   */
  const stopTracking = useCallback(() => {
    if (!locationState.isTracking) {
      console.warn('⚠ Location tracking not active');
      return false;
    }

    console.log('→ Stopping location tracking');

    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }

    if (stopTrackingRef.current) {
      stopTrackingRef.current();
      stopTrackingRef.current = null;
    }

    setLocationState((prev) => ({
      ...prev,
      isTracking: false,
    }));

    return true;
  }, [locationState.isTracking]);

  /**
   * Toggle location tracking
   */
  const toggleTracking = useCallback(
    async (enabled: boolean, intervalMs?: number) => {
      if (enabled) {
        return await startTracking(intervalMs);
      } else {
        return stopTracking();
      }
    },
    [startTracking, stopTracking]
  );

  /**
   * Calculate distance between two GPS coordinates (Haversine formula)
   */
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371000; // Earth radius in meters
      const φ1 = (lat1 * Math.PI) / 180;
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) *
          Math.cos(φ2) *
          Math.sin(Δλ / 2) *
          Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c; // Distance in meters
    },
    []
  );

  /**
   * Check if location is within a certain distance from a point
   */
  const isNearby = useCallback(
    (targetLat: number, targetLon: number, thresholdMeters = 5000): boolean => {
      if (!locationState.coords) return false;

      const distance = calculateDistance(
        locationState.coords.latitude,
        locationState.coords.longitude,
        targetLat,
        targetLon
      );

      return distance <= thresholdMeters;
    },
    [locationState.coords, calculateDistance]
  );

  /**
   * Watch location continuously (more power-intensive)
   * Use sparingly - prefer startTracking for periodic updates
   */
  const watchLocation = useCallback(
    async (
      onLocationChange: (coords: LocationCoords) => void,
      onError?: (error: string) => void
    ) => {
      if (!navigator.geolocation) {
        const errorMsg = 'Geolocation not supported';
        onError?.(errorMsg);
        return null;
      }

      console.log('→ Starting continuous location watch');

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const coords: LocationCoords = {
            latitude,
            longitude,
            accuracy,
            timestamp: Date.now(),
          };

          onLocationChange(coords);
          updateLocation(latitude, longitude, accuracy);
        },
        (error) => {
          let errorMessage = 'Location watch error';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          onError?.(errorMessage);
          console.error(`✗ ${errorMessage}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );

      // Return cleanup function
      return () => {
        console.log('→ Stopping continuous location watch');
        navigator.geolocation.clearWatch(watchId);
      };
    },
    [updateLocation]
  );

  /**
   * Auto-start tracking on mount if enabled in settings
   */
  useEffect(() => {
    if (settings?.locationTrackingEnabled && !locationState.isTracking) {
      startTracking(60000); // Start with 60 second interval
    }
  }, [settings?.locationTrackingEnabled, locationState.isTracking, startTracking]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    // Current state
    coords: locationState.coords,
    isTracking: locationState.isTracking,
    isLoading: locationState.isLoading,
    error: locationState.error,

    // Actions
    requestLocation,
    startTracking,
    stopTracking,
    toggleTracking,
    watchLocation,
    calculateDistance,
    isNearby,
  };
};

export type UseLocationReturn = ReturnType<typeof useLocation>;
