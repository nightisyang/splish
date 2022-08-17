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

const MapComponent = ({
  type,
  regionInput,
  animateToInput,
  styleInput,
  coordInput,
  zoomLevelInput,
  liteModeInput,
}) => {
  const [isMapReady, setMapReady] = useState(false);
  const [isType, setType] = useState();
  const [isMarkerRendered, setMarkerRender] = useState(null);
  const mapRef = useRef(null);
  const [mapRender, setMapRender] = useState(null);
  const [isRegionChange, setRegionChange] = useState(false);
  const [newRegion, setNewRegion] = useState(regionInput);

  //   useEffect(() => {
  //     console.log(`setting type: ${type} and resetting state`);
  //     setType(type);
  //     setMarkerRender(null);
  // setMapReady(false);
  // mapRef.current = null;
  //   }, [type]);

  //   useEffect(() => {}, [isType]);

  //   if (type === 'main') {
  //     mapRef.current = null;
  //     console.log(type);
  //     setType('main');
  //     return;
  //   }

  //   if (type === 'info') {
  //     mapRef.current = null;
  //     console.log(`type is: ${type}`);
  //     console.log(`coordInput is: ${coordInput}`);
  //     setType('info');
  //     return;
  //   }

  const handleMapReady = () => {
    setMapReady(true);
    console.log('Map ready, loading animation...');
  };

  const animateToRegionHolder = animateTime => {
    // console.log('executing animation');

    if (!mapRef.current) {
      console.log('Map ref is undefined');
      //   console.log(mapRef.current);
    }

    if (mapRef.current) {
      console.log('animating...');
      console.log(animateToInput);
      mapRef.current.animateToRegion(animateToInput, animateTime);
    }
  };

  useEffect(() => {
    // if (Platform.OS === 'android' && type === 'info') {
    //   return;
    // }

    let animationDelay;
    if (isMapReady) {
      animationDelay = setTimeout(() => {
        animateToRegionHolder(3500);
      }, 500);
    }

    return () => {
      clearTimeout(animationDelay);
      console.log('Clearing timeout after region change...');
    };
  }, [isRegionChange, isMapReady]);

  const MarkerRender = () => {
    let markerRenderResult;
    if (type === 'main') {
      markerRenderResult = waterfallCoords.map((el, i) => {
        return <Marker key={i} title={el.title} coordinate={el.coordinates} />;
      });
    }

    if (type === 'info') {
      //   const [lat, lng] = coordInput;
      //   console.log(`Input coordinates are ${lat}, ${lng}`);
      markerRenderResult = <Marker coordinate={coordInput} />;
    }

    setMarkerRender(markerRenderResult);
    console.log(`Map is ready: ${isMapReady}`);

    // console.log(markerRenderResult);
    return;
  };

  //   useEffect(() => {
  //     let hackTimeout;

  //     const androidHack = () => {
  //       MarkerRender();
  //     };

  //     if (Platform.OS === 'android' && type === 'info') {
  //       hackTimeout = setTimeout(() => {
  //         androidHack();
  //         if (type === 'info') {
  //           console.log(`MapMarker is ready: ${isMarkerRendered}`);
  //         } else {
  //           console.log('Lots of markers rendered');
  //         }

  //         setRegionChange(true);
  //         mapRef.current.animateToRegion(animateToInput, 1500);
  //       }, 500);

  //       return () => {
  //         clearTimeout(hackTimeout);
  //         console.log('Clearing timeout using hack...');
  //       };
  //     }
  //   }, [isMapReady]);

  return (
    <View style={{flex: 1, minHeight: 150, position: 'relative'}}>
      <MapView
        ref={mapRef}
        region={newRegion}
        style={{flex: 1}}
        provider={PROVIDER_GOOGLE}
        mapType="terrain"
        minZoomLevel={zoomLevelInput}
        liteMode={liteModeInput}
        onRegionChangeComplete={() => {
          console.log(`%%%%%%%%% REGION CHANGE COMPLETE %%%%%%%%%%`);
          MarkerRender();
          if (type === 'info') {
            console.log(`MapMarker is ready: ${isMarkerRendered}`);
          } else {
            console.log('Lots of markers rendered');
          }

          setRegionChange(true);
        }}
        onMapReady={e => {
          console.log('########### ONMAPREADY #############');
          handleMapReady();
          // console.log('map ready, initializing region...');
        }}
        zoomControlEnabled={true}>
        {isMarkerRendered}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    // justifyContent: 'center',
    backgroundColor: '#ECF0F1',
  },
});

export default MapComponent;
