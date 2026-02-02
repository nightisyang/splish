import React, { memo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SplishLogo } from '@/src/components/SplishLogo';
import { getApiUrl } from '@/src/config';

const THEME = {
  primary: '#6200ee',
  accent: '#80DDD9',
  background: '#ECF0F1',
};

// Memoized activity item following react-native-skills best practices
const ActivityItem = memo(function ActivityItem({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: string | null;
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={[styles.activityIconStyle, disabled && styles.disabledActivity]}
      onPress={disabled ? undefined : onPress}
    >
      {icon ? (
        <Image
          source={{ uri: icon }}
          style={styles.gifIconStyle}
          contentFit="cover"
        />
      ) : (
        <MaterialCommunityIcons name="tools" size={50} color="#888" />
      )}
      <Text style={[styles.activityTextStyle, disabled && styles.disabledText]}>
        {label}
      </Text>
    </Pressable>
  );
});

// Memoized featured card
const FeaturedCard = memo(function FeaturedCard({
  name,
  description,
  imageUri,
  onPress,
}: {
  name: string;
  description: string;
  imageUri: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.featuredCard} onPress={onPress}>
      <Image
        source={{ uri: imageUri }}
        style={styles.featuredImage}
        contentFit="cover"
      />
      <View style={styles.featuredContent}>
        <Text style={styles.featuredTitle}>{name}</Text>
        <Text style={styles.featuredDesc} numberOfLines={2}>
          {description}
        </Text>
      </View>
    </Pressable>
  );
});

export default function HomeScreen() {
  const handleNavigateToAbout = () => {
    router.push('/(tabs)/about');
  };

  const handleNavigateToWaterfalls = () => {
    router.push('/(tabs)/waterfalls');
  };

  const handleFeaturedPress = () => {
    router.push({
      pathname: '/(tabs)/info',
      params: { waterfallId: '62e257d0a55e10ce13603aa6' },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SplishLogo size={50} stroke={THEME.accent} />
        <Text style={styles.titleText}>splish.</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <Pressable style={styles.heroBanner} onPress={handleNavigateToAbout}>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroText}>splish?</Text>
          </View>
          <Image
            source={{ uri: getApiUrl('/ui/santai.jpeg') }}
            style={styles.heroImage}
            contentFit="cover"
          />
        </Pressable>

        {/* Activity Section */}
        <View style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <View style={styles.activityRow}>
            <ActivityItem
              icon={getApiUrl('/ui/home_waterfall.gif')}
              label="Waterfalls"
              onPress={handleNavigateToWaterfalls}
            />
            <ActivityItem icon={null} label="Trails" disabled />
            <ActivityItem icon={null} label="Camp" disabled />
            <ActivityItem icon={null} label="Adventures" disabled />
          </View>
        </View>

        {/* Featured Section */}
        <View style={styles.featuredContainer}>
          <Text style={styles.sectionTitleLight}>Featured</Text>
          <FeaturedCard
            name="Usun Apau"
            description="Remote waterfalls with difficult access. The Julan fall is the tallest fall of Sarawak"
            imageUri="http://chinup.rocks:8080/images/usun_apau.JPG"
            onPress={handleFeaturedPress}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: THEME.primary,
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 33,
    color: 'white',
    marginLeft: 10,
  },
  scrollView: {
    flex: 1,
  },
  heroBanner: {
    margin: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  heroTextContainer: {
    position: 'absolute',
    zIndex: 1,
    paddingLeft: 20,
    top: 20,
  },
  heroText: {
    fontWeight: 'bold',
    fontSize: 25,
    color: 'white',
    backgroundColor: 'green',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  heroImage: {
    width: '100%',
    height: 200,
  },
  activityContainer: {
    backgroundColor: THEME.background,
    borderRadius: 20,
    marginHorizontal: 5,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    paddingLeft: 15,
    paddingVertical: 5,
    color: '#333',
  },
  sectionTitleLight: {
    fontSize: 22,
    fontWeight: '700',
    paddingLeft: 15,
    paddingVertical: 5,
    color: 'white',
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 10,
  },
  activityIconStyle: {
    height: 80,
    width: 80,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd',
  },
  disabledActivity: {
    backgroundColor: '#ccc',
  },
  gifIconStyle: {
    width: 80,
    height: 80,
  },
  activityTextStyle: {
    position: 'absolute',
    bottom: 5,
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  disabledText: {
    color: '#666',
    textShadowColor: 'transparent',
  },
  featuredContainer: {
    paddingVertical: 10,
  },
  featuredCard: {
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: 'white',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  featuredImage: {
    width: '100%',
    height: 150,
  },
  featuredContent: {
    padding: 15,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  featuredDesc: {
    fontSize: 14,
    color: '#666',
  },
});
