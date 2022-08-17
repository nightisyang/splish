import React, {useState, useRef, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';

import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';

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
  const mapRef = useRef(null);
  const [isMapReady, setMapReady] = useState(false);
  const [isMarkerRendered, setMarkerRender] = useState(null);
  const [isRegionChange, setRegionChange] = useState(false);
  const [newRegion, setNewRegion] = useState(regionInput);

  const handleMapReady = () => {
    setMapReady(true);
    console.log('Map ready, loading animation...');
  };

  const animateToRegionHolder = animateTime => {
    if (!mapRef.current) {
      console.log('Map ref is undefined');
    }

    if (mapRef.current) {
      console.log('animating...');
      console.log(animateToInput);
      mapRef.current.animateToRegion(animateToInput, animateTime);
    }
  };

  useEffect(() => {
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
      markerRenderResult = <Marker coordinate={coordInput} />;
    }
    setMarkerRender(markerRenderResult);
    console.log(`Map is ready: ${isMapReady}`);
    return;
  };

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
