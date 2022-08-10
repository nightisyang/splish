import React, {useState, useRef, useCallback, useEffect} from 'react';
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

const Maps = () => {
  const [isMapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);

  const handleMapReady = useCallback(() => {
    setMapReady(true);
    console.log('Map ready, loading animation...');
  }, []);

  const animateToRegionHolder = (lat, lng) => {
    console.log('executing animation');

    if (!mapRef.current) {
      console.log('Map ref is undefined');
      console.log(mapRef.current);
    }

    if (mapRef.current) {
      console.log('waiting...');
      mapRef.current.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: LATITUD_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        },
        5000,
      );
    }
  };

  useEffect(() => {
    // console.log(mapRef.current);

    let animationDelay;
    if (mapRef) {
      animationDelay = setTimeout(() => {
        animateToRegionHolder(5.02017, 100.84717);
      }, 200);
    }
    return () => {
      clearTimeout(animationDelay);
      console.log('Clearing timeout...');
    };
  }, [mapRef]);

  function padding() {
    // hack to get maps to show on ios
    if (Platform.OS === 'ios') {
      return <Text />;
    }
  }

  return (
    <StatusBarTheme>
      <SafeAreaView style={styles.container}>
        <View style={{flex: 1, position: 'relative'}}>
          <MapView
            ref={mapRef}
            region={region}
            style={isMapReady ? styles.map : {}}
            provider={PROVIDER_GOOGLE}
            mapType="terrain"
            minZoomLevel={5}
            onMapReady={e => {
              handleMapReady();
              console.log('map ready, initializing region...');
            }}
            zoomControlEnabled={true}>
            {waterfallCoords.map((el, i) => {
              return (
                <Marker key={i} title={el.title} coordinate={el.coordinates} />
              );
            })}
            {padding()}
          </MapView>
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

export default Maps;
