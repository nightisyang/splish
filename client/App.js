/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState} from 'react';
// import {Node} from 'react';
import {View, StyleSheet} from 'react-native';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import List from './component/List';
import Maps from './component/Maps';
import Info from './component/Info';
import About from './component/About';
import Home from './component/Home';
import Icon from './component/Icon';
import Test from './component/Test';

const Tab = createMaterialBottomTabNavigator();

function HomeScreen() {
  return <Home />;
}

function MapScreen() {
  return <Maps />;
}

function WaterfallScreen({route, navigation}) {
  const [screenStatus, setScreenStatus] = useState('');
  // console.log(navigation);
  // console.log(route);

  useEffect(() => {
    const returning = navigation.addListener('focus', () => {
      // console.log('returning List');
      setScreenStatus('returning');
    });

    const leaving = navigation.addListener('blur', () => {
      // console.log('leaving List');
      setScreenStatus('leaving');
    });

    // return unsubscribe;
  }, [navigation]);

  return <List onScreenChange={screenStatus} />;
}
function InfoScreen({route, navigation}) {
  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('focus', () => {
  //     console.log('Info in focus');
  //   });

  //   return unsubscribe;
  // }, [navigation]);

  // console.log(route);
  return <Info onRoute={route} />;
}

function AboutScreen({route, navigation}) {
  // console.log(route);
  return <About />;
}
function TestScreen({route, navigation}) {
  // console.log(route);
  return <Test />;
}

const App = () => {
  const [nightMode, setNightmode] = useState(false);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      backBehavior="history"
      // screenListeners={({navigation}) => ({
      //   state: e => {
      //     // Do something with the state
      //     console.log('state changed', e.data);

      //     // Do something with the `navigation` object
      //     if (!navigation.canGoBack()) {
      //       console.log("we're on the initial screen");
      //     }
      //   },
      // })}
    >
      {/* <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Details" component={DetailsScreen} /> */}
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
                // fill="purple"
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
      <Tab.Screen
        name="Test"
        component={TestScreen}
        options={{
          tabBarLabel: 'Test',
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

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    // position: 'absolute',
    // flexDirection: 'column',
    backgroundColor: 'grey',
    // alignContent: 'stretch',
    // margin: 20,
  },

  header: {
    // position: 'absolute',
    // right: 0,
    // top: 0,
    // bottom: 0,
    // justifyContent: 'center',
    // alignItems: 'center',
    // paddingHorizontal: 20,
  },

  dropdownContainer: {
    // flex: 1,
    // justifyContent: 'space-between',
    // alignItems: 'center',
    // backgroundColor: 'pink',
    // height: 150,
    // padding: 20,
    // margin: 50,
    // paddingHorizontal: 10,
  },

  listCards: {
    // flex: 2,
  },

  safeContainerStyle: {
    // flex: 1,
    // margin: 10,
    // justifyContent: 'center',
    // alignSelf: 'stretch',
    // backgroundColor: 'green',
  },
});

export default App;
