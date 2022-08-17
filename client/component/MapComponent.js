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

  // sets map ready state for useEffects
  const handleMapReady = () => {
    setMapReady(true);
  };

  // animate to region, used in useEffect and is called when map is ready or region is changed
  const animateToRegionHolder = animateTime => {
    if (!mapRef.current) {
      console.log('Map ref is undefined');
    }

    if (mapRef.current) {
      mapRef.current.animateToRegion(animateToInput, animateTime);
    }
  };

  // renders marker and stored in state, only called when region change is complete
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
  }, [isRegionChange]);

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
          //   console.log(`%%%%%%%%% REGION CHANGE COMPLETE %%%%%%%%%%`);
          MarkerRender();
          setRegionChange(true);
        }}
        onMapReady={e => {
          //   console.log('########### ONMAPREADY #############');
          handleMapReady();
          setMarkerRender(null);
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
