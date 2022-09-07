import React, {useState, useRef, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import MapView, {
  Callout,
  Marker,
  Circle,
  PROVIDER_GOOGLE,
} from 'react-native-maps';

import waterfallCoords from '../assets/waterfallMapCoords.json';

const MapComponent = ({
  navigate,
  type,
  regionInput,
  animateToInput,
  styleInput,
  coordInput,
  zoomLevelInput,
  liteModeInput,
  onCalloutClick,
  userCoords,
  showsUserLocationInput,
}) => {
  const mapRef = useRef(null);
  const [isMapReady, setMapReady] = useState(false);
  const [isMarkerRendered, setMarkerRender] = useState(null);
  const [isRegionChange, setRegionChange] = useState(false);
  const [newRegion, setNewRegion] = useState(regionInput);

  const navigation = useNavigation();

  // sets map ready state for useEffects
  const handleMapReady = () => {
    setMapReady(true);
  };

  useEffect(() => {
    if (type === 'info') {
      setMarkerRender(null);
      setNewRegion(regionInput);
    }
  }, [coordInput, regionInput]);

  // animate to region, used in useEffect and is called when map is ready or region is changed
  const animateToRegionHolder = animateTime => {
    if (!mapRef.current) {
      console.log('Map ref is undefined');
    }

    if (mapRef.current) {
      mapRef.current.animateToRegion(animateToInput, animateTime);
    }
  };

  const passIdToParam = id => {
    navigation.navigate('Info', {
      waterfallID: id,
      userLoc: {latitude: userCoords.latitude, longitude: userCoords.longitude},
    });
  };

  // renders marker and stored in state, only called when region change is complete
  const MarkerRender = () => {
    let markerRenderResult;
    if (type === 'main') {
      markerRenderResult = waterfallCoords.map((el, i) => {
        return (
          <Marker key={i} title={el.title} coordinate={el.coordinates}>
            <Callout
              onPress={() => {
                // console.log(el.id);
                passIdToParam(el.id);
              }}>
              <Text>{el.title}</Text>
            </Callout>
          </Marker>
        );
      });
    }

    if (type === 'info') {
      markerRenderResult = <Marker coordinate={coordInput} />;
    }

    // set marker element into state, component to be re-rendered after it's complete
    setMarkerRender(markerRenderResult);
    return;
  };

  // executes animation only after map is ready, or region is changed, onRegionChange does not fire for android when browsing individual pages (same region?)
  useEffect(() => {
    let animationDelay;
    if (isMapReady) {
      animationDelay = setTimeout(() => {
        animateToRegionHolder(3500);
      }, 500);
    }

    return () => {
      clearTimeout(animationDelay);
    };
  }, [isRegionChange, newRegion, userCoords]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        region={newRegion}
        style={styles.flex}
        provider={PROVIDER_GOOGLE}
        mapType="terrain"
        minZoomLevel={zoomLevelInput}
        liteMode={liteModeInput}
        onRegionChangeComplete={(region, details) => {
          if (!details?.isGesture) {
            console.log('%%%%%%%%% REGION CHANGE COMPLETE %%%%%%%%%%');
            MarkerRender();
            setRegionChange(true);
          }
        }}
        onMapReady={e => {
          console.log('########### ONMAPREADY #############');
          handleMapReady();
          setMarkerRender(null);
        }}
        zoomControlEnabled={true}
        rotateEnabled={false}
        pitchEnabled={false}
        // loadingEnabled={true}
        showsUserLocation={showsUserLocationInput}>
        {isMarkerRendered}
        {!!userCoords && (
          <>
            <Circle
              center={{
                latitude: userCoords.latitude,
                longitude: userCoords.longitude,
              }}
              radius={userCoords.accuracy}
              strokeColor="rgba(0, 150, 255, 0.5)"
              fillColor="rgba(0, 150, 255, 0.5)"
            />
          </>
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, minHeight: 150, position: 'relative'},
  flex: {flex: 1},
});

export default MapComponent;
