import React, {useState, useRef, useEffect} from 'react';
import {
  SafeAreaView,
  StatusBar,
  Button,
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  Appbar,
  DarkTheme,
  DefaultTheme,
  Provider,
  Surface,
  ThemeProvider,
} from 'react-native-paper';

import {LatLng, LeafletView} from 'react-native-leaflet-view';

const DEFAULT_COORDINATE = {
  lat: 3.140853,
  lng: 101.693207,
};

const Maps = () => {
  const [nightMode, setNightmode] = useState(false);

  return (
    <Provider theme={nightMode ? DarkTheme : DefaultTheme}>
      <ThemeProvider theme={nightMode ? DarkTheme : DefaultTheme}>
        <StatusBar
          // animated={true}
          backgroundColor={
            nightMode ? DarkTheme.colors.surface : DefaultTheme.colors.primary
          }
          barStyle="default"
          // showHideTransition={statusBarTransition}
          // hidden={hidden}
        />
        <Appbar.Header statusBarHeight={0}>
          {/* <Appbar.Content title="Maps" /> */}
        </Appbar.Header>
        <SafeAreaView style={styles.container}>
          <LeafletView
            mapLayers={[
              {
                attribution:
                  '&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
                baseLayerIsChecked: true,
                baseLayerName: 'OpenStreetMap.Mapnik',
                url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
              },
            ]}
            mapMarkers={[
              {
                position: DEFAULT_COORDINATE,
                icon: '📍',
                size: [32, 32],
              },
            ]}
            mapCenterPosition={DEFAULT_COORDINATE}
            // doDebug={false}
            zoom={5}
          />
        </SafeAreaView>
      </ThemeProvider>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ECF0F1',
  },

  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default Maps;
