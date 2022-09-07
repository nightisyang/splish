/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import List from './component/List';
import Maps from './component/Maps';
import Info from './component/Info';
import About from './component/About';
import Home from './component/Home';
import Icon from './component/Icon';

const Tab = createMaterialBottomTabNavigator();

function HomeScreen() {
  return <Home />;
}

function MapScreen() {
  return <Maps />;
}

function WaterfallScreen({route, navigation}) {
  const [screenStatus, setScreenStatus] = useState('');

  useEffect(() => {
    navigation.addListener('focus', () => {
      setScreenStatus('returning');
    });

    navigation.addListener('blur', () => {
      setScreenStatus('leaving');
    });
  }, [navigation]);

  return <List onScreenChange={screenStatus} />;
}
function InfoScreen({route, navigation}) {
  return <Info onRoute={route} />;
}

function AboutScreen({route, navigation}) {
  return <About />;
}

const App = () => {
  return (
    <Tab.Navigator initialRouteName="Home" backBehavior="history">
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons name="map" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Waterfalls"
        component={WaterfallScreen}
        options={{
          tabBarLabel: 'Waterfalls',
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons name="waves" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({color}) => (
            <View style={{marginTop: -8}}>
              <Icon
                name="SplishLogo"
                height="38"
                width="38"
                viewBox="10 26 180 148"
                stroke="#80DDD9"
                strokeWidth="4"
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Info"
        component={InfoScreen}
        options={{
          tabBarLabel: 'Info',
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons
              name="information-outline"
              color={color}
              size={26}
            />
          ),
        }}
      />
      <Tab.Screen
        name="About"
        component={AboutScreen}
        options={{
          tabBarLabel: 'About',
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons
              name="comment-question-outline"
              color={color}
              size={26}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default App;
