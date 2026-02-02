import React, { memo, useCallback, useRef, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { Image } from 'expo-image';
import { Galeria } from '@nandorojo/galeria';
import { useLocalSearchParams, router } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useWaterfallDetails } from '@/src/hooks/useWaterfalls';
import { SplishLogo } from '@/src/components/SplishLogo';

const LATITUDE_DELTA = 0.2;

// Memoized detail row component
const DetailRow = memo(function DetailRow({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
}: {
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>{leftLabel}</Text>
        <Text style={styles.detailValue}>{leftValue}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>{rightLabel}</Text>
        <Text style={styles.detailValue}>{rightValue}</Text>
      </View>
    </View>
  );
});

// Empty state when no waterfall selected
const EmptyState = memo(function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.logoBackground}>
        <SplishLogo size={200} stroke="#80DDD9" fill="#80DDD9" />
      </View>
      <Text style={styles.emptyText}>
        Select a waterfall from the{' '}
        <Text style={styles.link} onPress={() => router.push('/(tabs)/map')}>
          Map
        </Text>{' '}
        or{' '}
        <Text style={styles.link} onPress={() => router.push('/(tabs)/waterfalls')}>
          List
        </Text>
        !
      </Text>
    </View>
  );
});

export default function InfoScreen() {
  const { waterfallId } = useLocalSearchParams<{
    waterfallId?: string;
  }>();

  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  // Rule 4.1: Use ref for scroll tracking, only setState for UI updates
  const scrollIndexRef = useRef(0);
  const [displayIndex, setDisplayIndex] = useState(0);

  const { data, isLoading, error } = useWaterfallDetails(waterfallId || null);

  const waterfall = data?.waterfall;
  const distance = data?.distance;

  // Calculate coordinates - Rule 1.1: explicit undefined check for 0 values
  const latitude = waterfall?.coordinate?.[1];
  const longitude = waterfall?.coordinate?.[0];
  const hasValidCoordinates = latitude !== undefined && longitude !== undefined;
  const longitudeDelta = LATITUDE_DELTA * (width / 250);

  const totalImages = (waterfall?.imgFilenameArr?.length || 0) + 1; // +1 for map

  // Rule 2.1: Memoize dynamic style to avoid inline objects
  const mediaItemStyle = useMemo(
    () => [styles.mediaItem, { width }],
    [width]
  );

  const scrollToIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalImages) {
        scrollRef.current?.scrollTo({ x: width * index, animated: true });
        scrollIndexRef.current = index;
        setDisplayIndex(index);
      }
    },
    [width, totalImages]
  );

  // Rule 4.1: Use functional setState to avoid stale closures
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offsetX / width);
      // Only update state if index actually changed
      if (newIndex !== scrollIndexRef.current) {
        scrollIndexRef.current = newIndex;
        setDisplayIndex(newIndex);
      }
    },
    [width]
  );

  // Rule 9.6: Galeria handles image press/lightbox natively
  const imageUrls = useMemo(
    () => waterfall?.imgFilenameArr?.map((img) => img.uri) || [],
    [waterfall?.imgFilenameArr]
  );

  if (!waterfallId) {
    return <EmptyState />;
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (error || !waterfall) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load waterfall details</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
          {waterfall.name}
        </Text>
        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="map-marker" size={18} color="#666" />
          <Text style={styles.location}>{waterfall.state}</Text>
        </View>
      </View>

      {/* Media Carousel */}
      <View style={styles.mediaContainer}>
        {/* Navigation arrows */}
        <Pressable
          style={[styles.arrow, styles.arrowLeft]}
          onPress={() => scrollToIndex(displayIndex - 1)}
        >
          <IconButton icon="chevron-left" size={30} />
        </Pressable>
        <Pressable
          style={[styles.arrow, styles.arrowRight]}
          onPress={() => scrollToIndex(displayIndex + 1)}
        >
          <IconButton icon="chevron-right" size={30} />
        </Pressable>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
        >
          {/* Map view - Rule 1.1: explicit check for coordinates */}
          <View style={mediaItemStyle}>
            {hasValidCoordinates ? (
              <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                  latitude: latitude!,
                  longitude: longitude!,
                  latitudeDelta: LATITUDE_DELTA,
                  longitudeDelta,
                }}
                mapType="terrain"
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker coordinate={{ latitude: latitude!, longitude: longitude! }} />
              </MapView>
            ) : null}
          </View>

          {/* Images - Rule 9.6: Use Galeria for native lightbox */}
          <Galeria urls={imageUrls}>
            {waterfall.imgFilenameArr.map((img, index) => (
              <View key={img.uri} style={mediaItemStyle}>
                <Galeria.Image index={index}>
                  <Image
                    source={{ uri: img.uri }}
                    style={styles.image}
                    contentFit="cover"
                    transition={200}
                  />
                </Galeria.Image>
              </View>
            ))}
          </Galeria>
        </ScrollView>

        {/* Page indicator */}
        <View style={styles.pageIndicator}>
          <Text style={styles.pageText}>
            {displayIndex + 1} / {totalImages}
          </Text>
        </View>
      </View>

      {/* Details */}
      <ScrollView style={styles.detailsContainer}>
        <DetailRow
          leftLabel="Distance"
          leftValue={distance ? `${distance} km` : 'N/A - select from Map'}
          rightLabel="Waterfall Profile"
          rightValue={waterfall.waterfallProfile || 'N/A'}
        />
        <DetailRow
          leftLabel="Accessibility"
          leftValue={waterfall.accessibility || 'N/A'}
          rightLabel="Water Source"
          rightValue={waterfall.waterSource || 'N/A'}
        />
        <DetailRow
          leftLabel="Difficulty"
          leftValue={waterfall.difficulty || 'N/A'}
          rightLabel="Last Update"
          rightValue={waterfall.lastUpdate || 'N/A'}
        />

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{waterfall.description}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECF0F1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECF0F1',
    padding: 20,
  },
  logoBackground: {
    opacity: 0.3,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  header: {
    padding: 15,
    backgroundColor: 'white',
  },
  name: {
    fontSize: 28,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  location: {
    marginLeft: 5,
    color: '#666',
  },
  mediaContainer: {
    height: 250,
    position: 'relative',
  },
  mediaItem: {
    height: 250,
  },
  map: {
    flex: 1,
  },
  image: {
    flex: 1,
  },
  arrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -25,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 25,
  },
  arrowLeft: {
    left: 10,
  },
  arrowRight: {
    right: 10,
  },
  pageIndicator: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  pageText: {
    color: 'white',
    fontSize: 12,
  },
  detailsContainer: {
    flex: 1,
    padding: 15,
  },
  detailRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#ccc',
    marginVertical: 5,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    marginTop: 4,
    textAlign: 'center',
  },
  descriptionContainer: {
    marginTop: 15,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'justify',
  },
});
