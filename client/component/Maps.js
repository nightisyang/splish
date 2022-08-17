import React, {memo} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Platform,
} from 'react-native';

import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from 'react-native-maps';

import waterfallCoords from '../assets/waterfallMapCoords.json';
import MapComponent from './MapComponent';

import StatusBarTheme from './StatusBarTheme';

const LATITUD_DELTA = 2;
let LONGITUDE_DELTA;

const window = Dimensions.get('window');
const {width, height} = window;
LONGITUDE_DELTA = LATITUD_DELTA * (width / height);

const region = {
  latitude: 3.945651,
  longitude: 108.142868,
  latitudeDelta: 30,
  longitudeDelta: 30,
};

const animateTo = {
  latitude: 5.02017,
  longitude: 100.84717,
  latitudeDelta: LATITUD_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

const Maps = ({navigation, onReceiveID}) => {
  const passIDToAppHandler = id => {
    onReceiveID(id);
    // console.log(`${id} passed to parent`);
  };

  return (
    <StatusBarTheme>
      <SafeAreaView style={styles.container}>
        <View style={{flex: 1, position: 'relative'}}>
          <MapComponent
            type="main"
            regionInput={region}
            animateToInput={animateTo}
            styleInput={styles.map}
            zoomLevelInput={5}
            liteModeInput={false}
            onCalloutClick={passIDToAppHandler}
          />
        </View>
      </SafeAreaView>
    </StatusBarTheme>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    // justifyContent: 'center',
    backgroundColor: '#ECF0F1',
  },
  map: {
    // flex: 1,
    width: '100%',
    height: '100%',
    // backgroundColor: 'black',
  },
});

export default memo(Maps);
