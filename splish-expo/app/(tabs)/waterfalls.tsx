import React, { memo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useWaterfallsByState } from '@/src/hooks/useWaterfalls';
import { useAppStore } from '@/src/stores/useAppStore';
import { SplishLogo } from '@/src/components/SplishLogo';
import type { WaterfallSummary, MalaysianState, WaterfallImage } from '@/src/types/waterfall';

const MALAYSIAN_STATES: MalaysianState[] = [
  'Johor',
  'Kedah',
  'Kelantan',
  'Melaka',
  'Negeri Sembilan',
  'Pahang',
  'Perak',
  'Perlis',
  'Pulau Pinang',
  'Sabah',
  'Sarawak',
  'Selangor',
  'Terengganu',
];

// Memoized image item for horizontal scroll
// Rule 2.5: Pass primitives for better memoization
// Rule 2.2: Handle callback inside child with useCallback
const ImageItem = memo(function ImageItem({
  uri,
  index,
  onPress,
}: {
  uri: string;
  index: number;
  onPress: (index: number) => void;
}) {
  const handlePress = useCallback(() => {
    onPress(index);
  }, [index, onPress]);

  return (
    <Pressable onPress={handlePress} style={styles.imageItem}>
      <Image
        source={{ uri }}
        style={styles.cardImage}
        contentFit="cover"
        transition={200}
      />
    </Pressable>
  );
});

// Memoized waterfall card - following react-native-skills best practices
// Rule 2.5: Receive primitives for better memoization
const WaterfallCard = memo(function WaterfallCard({
  id,
  name,
  summary,
  images,
  onPress,
  onImagePress,
}: {
  id: string;
  name: string;
  summary: string;
  images: WaterfallImage[];
  onPress: (id: string) => void;
  onImagePress: (images: WaterfallImage[], index: number) => void;
}) {
  // Rule 2.2: Hoist callback, handle ID inside child
  const handlePress = useCallback(() => {
    onPress(id);
  }, [id, onPress]);

  const handleImagePress = useCallback(
    (index: number) => {
      onImagePress(images, index);
    },
    [images, onImagePress]
  );

  // Rule 2.2: Stable renderItem reference
  const renderImageItem = useCallback(
    ({ item, index }: { item: WaterfallImage; index: number }) => (
      <ImageItem uri={item.uri} index={index} onPress={handleImagePress} />
    ),
    [handleImagePress]
  );

  const keyExtractor = useCallback((item: WaterfallImage) => item.uri, []);

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      <Text style={styles.cardTitle}>{name}</Text>

      {/* Horizontal image scroll */}
      <View style={styles.imageScroll}>
        <FlatList
          data={images}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderImageItem}
          keyExtractor={keyExtractor}
        />
      </View>

      <Text style={styles.cardSummary} numberOfLines={2}>
        {summary}
      </Text>
    </Pressable>
  );
});

// Empty state component
const EmptyState = memo(function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.logoBackground}>
        <SplishLogo size={200} stroke="#80DDD9" fill="#80DDD9" />
      </View>
      <Text style={styles.emptyText}>Please select a state from the list above!</Text>
    </View>
  );
});

export default function WaterfallsScreen() {
  const { selectedState, setSelectedState, openImageModal } = useAppStore();
  const { data: waterfalls, isLoading, error } = useWaterfallsByState(selectedState);

  // Rule 2.2: Single callback instance, item calls with ID
  const handleWaterfallPress = useCallback((waterfallId: string) => {
    router.push({
      pathname: '/(tabs)/info',
      params: { waterfallId },
    });
  }, []);

  const handleImagePress = useCallback(
    (images: WaterfallImage[], index: number) => {
      openImageModal(images, index);
    },
    [openImageModal]
  );

  // Rule 2.5: Pass primitives to list items
  const renderItem = useCallback(
    ({ item }: { item: WaterfallSummary }) => (
      <WaterfallCard
        id={item.id}
        name={item.name}
        summary={item.summary}
        images={item.imgFilenameArr}
        onPress={handleWaterfallPress}
        onImagePress={handleImagePress}
      />
    ),
    [handleWaterfallPress, handleImagePress]
  );

  return (
    <View style={styles.container}>
      {/* State Picker */}
      <View style={styles.pickerContainer}>
        <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
        <Picker
          selectedValue={selectedState}
          onValueChange={(value) => setSelectedState(value)}
          style={styles.picker}
        >
          <Picker.Item label="Select a state..." value={null} />
          {MALAYSIAN_STATES.map((state) => (
            <Picker.Item key={state} label={state} value={state} />
          ))}
        </Picker>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load waterfalls</Text>
        </View>
      ) : !selectedState ? (
        <EmptyState />
      ) : waterfalls && waterfalls.length > 0 ? (
        <FlatList
          data={waterfalls}
          renderItem={renderItem}
                    keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No waterfalls found in {selectedState}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECF0F1',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 10,
    marginVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 10,
    marginVertical: 8,
    borderRadius: 10,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  imageScroll: {
    height: 150,
    marginBottom: 8,
  },
  imageItem: {
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardImage: {
    width: 160,
    height: 150,
  },
  cardSummary: {
    fontSize: 14,
    color: '#666',
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
});
