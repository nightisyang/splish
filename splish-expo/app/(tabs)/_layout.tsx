import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SplishLogo } from '@/src/components/SplishLogo';

const THEME = {
  primary: '#6200ee',
  accent: '#80DDD9',
  background: '#ECF0F1',
};

function TabBarIcon({ name, color }: { name: keyof typeof MaterialCommunityIcons.glyphMap; color: string }) {
  return <MaterialCommunityIcons name={name} size={26} color={color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: THEME.primary,
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        headerStyle: {
          backgroundColor: THEME.primary,
        },
        headerTintColor: '#fff',
      }}
      initialRouteName="home"
    >
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
        }}
      />
      <Tabs.Screen
        name="waterfalls"
        options={{
          title: 'Waterfalls',
          tabBarIcon: ({ color }) => <TabBarIcon name="waves" color={color} />,
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <View style={styles.logoContainer}>
              <SplishLogo size={38} stroke={THEME.accent} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="info"
        options={{
          title: 'Info',
          tabBarIcon: ({ color }) => <TabBarIcon name="information-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ color }) => <TabBarIcon name="comment-question-outline" color={color} />,
        }}
      />
      {/* Hide the default index and two screens */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    marginTop: -8,
  },
});
