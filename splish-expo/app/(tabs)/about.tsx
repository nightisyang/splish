import React, { useCallback, useEffect, useRef, memo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Linking,
  Alert,
  Animated,
} from 'react-native';
import { Text, Card } from 'react-native-paper';
import { Image } from 'expo-image';
import * as Clipboard from 'expo-clipboard';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { config } from '@/src/config';

const THEME = {
  primary: '#473FA8',
  background: '#ECF0F1',
  accent: '#80DDD9',
};

// Memoized fade-in animated view
const FadeInView = memo(function FadeInView({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [
            {
              scale: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.85, 1],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
});

// Memoized social link button
const SocialLink = memo(function SocialLink({
  icon,
  imageSource,
  onPress,
}: {
  icon?: string;
  imageSource?: any;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.linkIcon} onPress={onPress}>
      {icon ? (
        <MaterialCommunityIcons name={icon as any} size={50} color="#333" />
      ) : (
        <Image source={imageSource} style={styles.socialImage} contentFit="contain" />
      )}
    </Pressable>
  );
});

export default function AboutScreen() {
  const handlePress = useCallback(async (dest: 'wom' | 'github' | 'email' | 'instagram') => {
    switch (dest) {
      case 'wom': {
        const url = 'https://waterfallsofmalaysia.com/d.php';
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          Linking.openURL(url);
        }
        break;
      }
      case 'github': {
        const url = 'https://github.com/nightisyang';
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          Linking.openURL(url);
        }
        break;
      }
      case 'email': {
        await Clipboard.setStringAsync('example@example.com');
        Alert.alert('Email copied', 'Email address copied to clipboard');
        break;
      }
      case 'instagram': {
        const url = 'https://instagram.com';
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          Linking.openURL(url);
        }
        break;
      }
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <FadeInView style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/splish_logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </FadeInView>

      {/* About Card */}
      <Card style={styles.card} elevation={5}>
        <Card.Content>
          <View style={styles.cardDivider} />
          <Text style={styles.aboutText}>
            An outdoor focused app, with small beginnings. A work in progress.
            {'\n\n'}
            Credits and acknowledgement to the good folks at{' '}
            <Text style={styles.link} onPress={() => handlePress('wom')}>
              waterfallsofmalaysia.com
            </Text>{' '}
            where contents of the app are heavily appropriated from with permission.
            {'\n\n'}
            Information on the app is made available on a best effort basis and should
            not be construed as sole truth.
            {'\n\n'}
            Stay safe while making a splash!
          </Text>
        </Card.Content>
      </Card>

      {/* Social Links */}
      <View style={styles.socialContainer}>
        <View style={styles.socialRow}>
          <SocialLink icon="at" onPress={() => handlePress('email')} />
          <SocialLink
            imageSource={require('@/assets/images/github_logo.png')}
            onPress={() => handlePress('github')}
          />
          <SocialLink
            imageSource={require('@/assets/images/instagram_logo.png')}
            onPress={() => handlePress('instagram')}
          />
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version: {config.APP_VERSION}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.primary,
  },
  logoContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 150,
  },
  card: {
    flex: 3,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 20,
    backgroundColor: THEME.background,
  },
  cardDivider: {
    width: '70%',
    height: 1,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 20,
    marginTop: -10,
  },
  aboutText: {
    textAlign: 'justify',
    lineHeight: 22,
    fontSize: 14,
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  socialContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: 10,
  },
  linkIcon: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialImage: {
    width: 50,
    height: 50,
  },
  versionContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
  },
  versionText: {
    color: 'white',
    opacity: 0.8,
  },
});
