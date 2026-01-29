import { useQuery } from '@tanstack/react-query';
import { fetchWaterfallsByState, fetchWaterfallDetails } from '../api/waterfalls';
import { useAppStore } from '../stores/useAppStore';
import type { MalaysianState } from '../types/waterfall';

export function useWaterfallsByState(state: MalaysianState | null) {
  return useQuery({
    queryKey: ['waterfalls', state],
    queryFn: () => {
      if (!state) throw new Error('No state selected');
      return fetchWaterfallsByState(state);
    },
    enabled: !!state,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useWaterfallDetails(waterfallId: string | null) {
  const { userLocation } = useAppStore();

  const userLatLng = userLocation
    ? `${userLocation.latitude},${userLocation.longitude}`
    : undefined;

  return useQuery({
    queryKey: ['waterfall', waterfallId, userLatLng],
    queryFn: () => {
      if (!waterfallId) throw new Error('No waterfall ID');
      return fetchWaterfallDetails(waterfallId, userLatLng);
    },
    enabled: !!waterfallId,
    staleTime: 5 * 60 * 1000,
  });
}
