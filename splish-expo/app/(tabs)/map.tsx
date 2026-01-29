import React, { useRef, useEffect, useCallback, memo } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { router } from 'expo-router';
import { useLocation } from '@/src/hooks/useLocation';
import { useAppStore } from '@/src/stores/useAppStore';

// Waterfall coordinates - in production, fetch from API
import waterfallCoords from '@/assets/waterfallMapCoords.json';

const INITIAL_REGION = {
  latitude: 3.945651,
  longitude: 108.142868,
  latitudeDelta: 30,
  longitudeDelta: 30,
};

const ZOOM_DELTA = {
  latitudeDelta: 2,
  longitudeDelta: 2,
};

// Memoized marker component for better list performance
const WaterfallMarker = memo(function WaterfallMarker({
  id,
  title,
  coordinates,
  onPress,
}: {
  id: string;
  title: string;
  coordinates: { latitude: number; longitude: number };
  onPress: (id: string) => void;
}) {
  const handleCalloutPress = useCallback(() => {
    onPress(id);
  }, [id, onPress]);

  return (
    <Marker coordinate={coordinates} title={title}>
      <Callout onPress={handleCalloutPress}>
        <View style={styles.callout}>
          <Text style={styles.calloutText}>{title}</Text>
          <Text style={styles.calloutHint}>Tap for details</Text>
        </View>
      </Callout>
    </Marker>
  );
});

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const { location, loading, error } = useLocation();
  const { userLocation } = useAppStore();

  // Animate to user location when available
  useEffect(() => {
    if (location && mapRef.current) {
      const timeout = setTimeout(() => {
        mapRef.current?.animateToRegion(
          {
            latitude: location.latitude,
            longitude: location.longitude,
            ...ZOOM_DELTA,
          },
          3500
        );
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [location]);

  const handleMarkerPress = useCallback((waterfallId: string) => {
    router.push({
      pathname: '/(tabs)/info',
      params: {
        waterfallId,
        userLat: userLocation?.latitude?.toString(),
        userLng: userLocation?.longitude?.toString(),
      },
    });
  }, [userLocation]);

  if (loading && !location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        mapType="terrain"
        showsUserLocation
        showsMyLocationButton
        zoomControlEnabled
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {/* Waterfall markers */}
        {waterfallCoords.map((waterfall) => (
          <WaterfallMarker
            key={waterfall.id}
            id={waterfall.id}
            title={waterfall.title}
            coordinates={waterfall.coordinates}
            onPress={handleMarkerPress}
          />
        ))}

        {/* User location accuracy circle - Rule 1.1: explicit check */}
        {location?.accuracy !== undefined && location.accuracy > 0 ? (
          <Circle
            center={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            radius={location.accuracy}
            strokeColor="rgba(0, 150, 255, 0.5)"
            fillColor="rgba(0, 150, 255, 0.2)"
          />
        ) : null}
      </MapView>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECF0F1',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  callout: {
    padding: 10,
    minWidth: 100,
  },
  calloutText: {
    fontSize: 14,
    fontWeight: '600',
  },
  calloutHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  errorBanner: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 8,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
  },
});
