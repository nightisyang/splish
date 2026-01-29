import { create } from 'zustand';
import type { UserLocation, MalaysianState } from '../types/waterfall';

interface AppState {
  // User location
  userLocation: UserLocation | null;
  setUserLocation: (location: UserLocation | null) => void;

  // Selected state filter for waterfall list
  selectedState: MalaysianState | null;
  setSelectedState: (state: MalaysianState | null) => void;

  // Currently viewing waterfall
  selectedWaterfallId: string | null;
  setSelectedWaterfallId: (id: string | null) => void;

  // Image modal state
  imageModal: {
    visible: boolean;
    images: { uri: string }[];
    startIndex: number;
  };
  openImageModal: (images: { uri: string }[], startIndex: number) => void;
  closeImageModal: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // User location
  userLocation: null,
  setUserLocation: (location) => set({ userLocation: location }),

  // Selected state filter
  selectedState: null,
  setSelectedState: (selectedState) => set({ selectedState }),

  // Currently viewing waterfall
  selectedWaterfallId: null,
  setSelectedWaterfallId: (id) => set({ selectedWaterfallId: id }),

  // Image modal
  imageModal: {
    visible: false,
    images: [],
    startIndex: 0,
  },
  openImageModal: (images, startIndex) =>
    set({ imageModal: { visible: true, images, startIndex } }),
  closeImageModal: () =>
    set((state) => ({
      imageModal: { ...state.imageModal, visible: false },
    })),
}));
