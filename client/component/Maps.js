import React, {useState, useRef, useCallback, useEffect} from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';

import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from 'react-native-maps';

import StatusBarTheme from './StatusBarTheme';

const Maps = () => {
  const [isMapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);

  const handleMapReady = useCallback(() => {
    setMapReady(true);
  });

  const animateToRegionHolder = (lat, lng) => {
    useEffect(() => {
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0,
            longitudeDelta: 0.004,
          },
          2000,
        );
      }
    });
  };

  return (
    <StatusBarTheme>
      <SafeAreaView style={styles.container}>
        <MapView
          ref={mapRef}
          style={isMapReady ? styles.map : {}}
          provider={PROVIDER_DEFAULT}
          onMapReady={e => {
            handleMapReady();
            console.log('map ready, initializing region...');
            animateToRegionHolder(5.02017, 100.84717);
          }}
          zoomControlEnabled={true}>
          <Marker
            title="test"
            description="testing"
            coordinate={{latitude: 5.02017, longitude: 100.84717}}
          />
          <Text>TEXT</Text>
        </MapView>
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
    width: '100%',
    height: '100%',
    // backgroundColor: 'black',
  },
});

export default Maps;
