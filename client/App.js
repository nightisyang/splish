/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState} from 'react';
// import {Node} from 'react';
import {StyleSheet} from 'react-native';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import List from './component/List';
import Maps from './component/Maps';
import Info from './component/Info';
// import GeoExample from './component/Geolocation';

const Tab = createMaterialBottomTabNavigator();

// function HomeScreen({navigation}) {
//   return (
//     <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
//       <Text>Home Screen</Text>
//       <Button
//         title="Go to Details"
//         onPress={() => navigation.navigate('Info')}
//       />
//     </View>
//   );
// }

// function DetailsScreen() {
//   return (
//     <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
//       <Text>Details Screen</Text>
//     </View>
//   );
// }

function MapRoute() {
  return <Maps />;
}

function WaterfallRoute(rotue, navigate) {
  return <List />;
}
function InfoRoute({route, navigate}) {
  console.log(route);
  return <Info onRoute={route} />;
}

// function GeoExampleRoute() {
//   return <GeoExample />;
// }

const App = () => {
  const [nightMode, setNightmode] = useState(false);
  // const waterfallIDRef = useRef(null);

  // const navigateWaterfallDetails = useCallback(function (id) {
  //   waterfallIDRef.current = id;
  //   console.log('passed id to parent:', waterfallIDRef.current);
  // });

  // const UpdateInfo = () => {
  //   console.log(`In UpdateInfo: ${waterfallIDRef.current}`);
  //   return <Info waterfallID={waterfallIDRef.current} />;
  // };

  // useEffect(() => {
  //   UpdateInfo();
  // }, [navigateWaterfallDetails]);

  // useEffect(() => {
  //   navigation.navigate('Info');
  // }, [waterfallID]);
  // const setWaterfallDetails = function () {
  //   return <Info waterfallID={waterfallID} />;
  // };

  // useEffect(() => {
  //   setWaterfallDetails;
  // }, [waterfallID]);

  // const WaterfallRoute = () => <List passIDToApp={navigateWaterfallDetails} />;
  // const MapRoute = () => <Maps onReceiveID={navigateWaterfallDetails} />;
  // const InfoRoute = () => <UpdateInfo />;
  // const Info2Route = () => <Info2 waterfallID={waterfallID} />;

  return (
    <Tab.Navigator initialRouteName="Waterfalls">
      {/* <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Details" component={DetailsScreen} /> */}
      <Tab.Screen
        name="Map"
        component={MapRoute}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons name="map" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Waterfalls"
        component={WaterfallRoute}
        options={{
          tabBarLabel: 'Waterfalls',
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons name="waves" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Info"
        component={InfoRoute}
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
      {/* <Tab.Screen
        name="Geolocation"
        component={GeoExampleRoute}
        options={{
          tabBarLabel: 'Geolocation',
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons name="target" color={color} size={26} />
          ),
        }}
      /> */}
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
