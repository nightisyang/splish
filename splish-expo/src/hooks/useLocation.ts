import { useEffect, useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { useAppStore } from '../stores/useAppStore';
import type { UserLocation } from '../types/waterfall';

export function useLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userLocation, setUserLocation } = useAppStore();

  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setError('Location permission denied');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const userLoc: UserLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy ?? undefined,
      };

      setUserLocation(userLoc);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location');
    } finally {
      setLoading(false);
    }
  }, [setUserLocation]);

  // Request location on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return {
    location: userLocation,
    loading,
    error,
    refresh: requestLocation,
  };
}
