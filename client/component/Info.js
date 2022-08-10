import React from 'react';
import {useState, useRef, useCallback} from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
} from 'react-native';
import {PROVIDER_GOOGLE} from 'react-native-maps';
import {Appbar, IconButton, Text} from 'react-native-paper';
import FastImage from 'react-native-fast-image';

import StatusBarTheme from './StatusBarTheme';
import MapView, {Marker} from 'react-native-maps';

let viewHeight;
let calcWidth = Dimensions.get('window').width;
let screenIndex = 0;

const LATITUD_DELTA = 0.3;
let LONGITUDE_DELTA;
LONGITUDE_DELTA = LATITUD_DELTA * (calcWidth / 250);

const region = {
  latitude: 5.742,
  longitude: 102.37567,
  latitudeDelta: 0.09,
  longitudeDelta: LONGITUDE_DELTA,
};

const Info = () => {
  const [nightMode, setNightmode] = useState(false);
  const [isMapReady, setMapReady] = useState(false);
  // const [screenIndex, setScreenIndex] = useState(1);
  const mapRef = useRef(null);
  const scrollRef = useRef(null);

  const handleMapReady = useCallback(() => {
    setMapReady(true);
    console.log('Map ready, loading animation...');
  }, []);

  const onLayoutImage = event => {
    const {height} = event.nativeEvent.layout;
    viewHeight = Math.floor(height);
    console.log('viewHeight:', viewHeight);
  };

  const scrollNext = () => {
    if (screenIndex < 3) {
      // setScreenIndex(prev => prev + 1);
      screenIndex += 1;
      scrollRef.current?.scrollTo({
        x: calcWidth * screenIndex,
        animated: true,
      });
    }
    console.log(screenIndex);
  };

  const scrollPrev = () => {
    if (screenIndex > 0) {
      scrollRef.current?.scrollTo({
        x: calcWidth * (screenIndex - 1),
        animated: true,
      });

      // setScreenIndex(prev => prev - 1);
      screenIndex -= 1;
    }

    // if (screenIndex === 1) setScreenIndex(1);
    console.log(screenIndex);
  };

  return (
    <StatusBarTheme>
      <Appbar.Header>
        <Appbar.BackAction />
        <Appbar.Content title="Title" />
        <Appbar.Action icon={nightMode ? 'brightness-7' : 'brightness-3'} />
        <Appbar.Action icon="magnify" />
        <Appbar.Action icon="dots-vertical" />
      </Appbar.Header>
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Jeram Linang</Text>
          <View style={styles.subheadingContainer}>
            <IconButton icon="map-marker" style={styles.subheadingIcon} />
            <Text style={styles.subheadingText}>Pasir Puteh, Kelantan</Text>
          </View>
        </View>
        <View
          style={[
            styles.mediaContainer,
            {flexDirection: 'row', justifyContent: 'center'},
          ]}>
          <Pressable
            style={{
              justifyContent: 'center',
              position: 'absolute',
              zIndex: 1,
              left: 0,
              width: 50,
              height: '100%',
              // backgroundColor: 'pink',
            }}
            onPress={() => {
              console.log('Left Press');
              scrollPrev();
            }}>
            <IconButton
              icon="chevron-left"
              style={{backgroundColor: '#CBDCCB'}}
            />

            {/* {({pressed}) => (
              <Text style={styles.text}>
                {pressed ? 'Pressed!' : 'Press Me'}
              </Text>
            )} */}
          </Pressable>

          <Pressable
            style={{
              flex: 1,
              justifyContent: 'center',
              position: 'absolute',
              zIndex: 1,
              right: 0,
              width: 50,
              height: '100%',
              // backgroundColor: 'pink',
            }}
            onPress={() => {
              console.log('Right Press');
              scrollNext();
            }}>
            <IconButton
              icon="chevron-right"
              style={{backgroundColor: '#CBDCCB'}}
            />
            {/* {({pressed}) => (
              <Text style={styles.text}>
                {pressed ? 'Pressed!' : 'Press Me'}
              </Text>
            )} */}
          </Pressable>

          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            horizontal={true}
            pagingEnabled={true}
            onLayout={onLayoutImage}>
            {/* <View styles={[styles.flex, {width: calcWidth}]}> */}
            <MapView
              ref={mapRef}
              region={region}
              style={isMapReady ? {...{width: calcWidth, height: '100%'}} : {}}
              provider={PROVIDER_GOOGLE}
              mapType="terrain"
              minZoomLevel={9}
              zoomEnabled={false}
              scrollEnabled={false}
              loadingEnabled={true}
              // zoomControlEnabled={true}
              liteMode={true}
              onMapReady={e => {
                handleMapReady();
                console.log('map ready, initializing region...');
              }}>
              <Marker coordinate={{latitude: 5.742, longitude: 102.37567}} />
            </MapView>
            {/* </View> */}
            <FastImage
              source={require('../assets/img1.jpg')}
              resizeMode={FastImage.resizeMode.contain}
              style={[
                styles.image,
                {
                  width: calcWidth,
                  height: viewHeight,
                },
              ]}
            />
            <FastImage
              source={require('../assets/img2.jpg')}
              style={[
                styles.image,
                {
                  width: calcWidth,
                  height: viewHeight,
                },
              ]}
              resizeMode={FastImage.resizeMode.contain}
            />
            <FastImage
              source={require('../assets/img3.jpg')}
              style={[
                styles.image,
                {
                  width: calcWidth,
                  height: viewHeight,
                },
              ]}
              resizeMode={FastImage.resizeMode.contain}
            />
          </ScrollView>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={{fontSize: 20, fontWeight: '600'}}>Description</Text>
          <Text style={{textAlign: 'justify'}}>
            The Hutan Lipur Jeram Linang is located a few km south of road nr 4
            to Machang. It is popular with locals and has many facilities like a
            wading pool, chalets, etc.Most visitors will stay near to the pools,
            but there is a trail leading uphill to a number of waterfalls. The
            falls are not spectacular, but located in nice forest.
          </Text>
          <View style={{padding: 10}} />
          <View style={styles.flexRow}>
            <View style={styles.flex}>
              <View style={styles.profileBottomSeperator}>
                <View style={styles.flex}>
                  <Text style={styles.profileTextTitle}>Distance</Text>
                  <Text style={styles.profileTextContent}>10km</Text>
                </View>
                <View style={styles.profileMiddleSeperator} />
              </View>
              <View style={styles.profileBottomSeperator}>
                <View style={styles.flex}>
                  <Text style={styles.profileTextTitle}>Accessibility</Text>
                  <Text style={styles.profileTextContent}>Nature Park</Text>
                </View>
                <View style={styles.profileMiddleSeperator} />
              </View>
              <View style={styles.profileBottomSeperator}>
                <View style={styles.flex}>
                  <Text style={styles.profileTextTitle}>Difficulty</Text>
                  <Text style={styles.profileTextContent}>Easy</Text>
                </View>
                <View style={styles.profileMiddleSeperator} />
              </View>
            </View>
            <View style={styles.flex}>
              <View style={styles.profileBottomSeperator}>
                <View style={styles.flex}>
                  <Text style={styles.profileTextTitle}>Waterfall Profile</Text>
                  <Text style={styles.profileTextContent}>
                    Near vertical Falls
                  </Text>
                </View>
              </View>
              <View style={styles.profileBottomSeperator}>
                <View style={styles.flex}>
                  <Text style={styles.profileTextTitle}>Water source</Text>
                  <Text style={styles.profileTextContent}>Stream</Text>
                </View>
              </View>
              <View style={styles.profileBottomSeperator}>
                <View style={styles.flex}>
                  <Text style={styles.profileTextTitle}>Last update</Text>
                  <Text style={styles.profileTextContent}>March 2005</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </StatusBarTheme>
  );
};

export default Info;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECF0F1',
  },

  flex: {
    flex: 1,
  },

  flexRow: {
    flex: 1,
    flexDirection: 'row',
  },

  map: {
    // flex: 1,
    width: '100%',
    height: '100%',
    // backgroundColor: 'black',
  },

  headerContainer: {
    flex: 2,
    alignContent: 'center',
    marginBottom: 5,
  },

  headerText: {
    paddingHorizontal: 15,
    fontWeight: '600',
    fontSize: 30,
  },

  subheadingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'flex-start',
  },

  subheadingIcon: {
    alignSelf: 'center',
    marginBottom: 12,
  },

  subheadingText: {
    alignSelf: 'center',
    marginLeft: -12,
  },

  mediaContainer: {
    flex: 9,
  },

  image: {
    backgroundColor: 'black',
  },

  detailsContainer: {
    flex: 11,
    padding: 10,
  },

  profileTextTitle: {
    fontSize: 12,
    alignSelf: 'center',
    // paddingVertical: 2,
  },

  profileTextContent: {
    fontSize: 16,
    alignSelf: 'center',
    paddingVertical: 2,
  },

  profileBottomSeperator: {
    flexDirection: 'row',
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 5,
  },

  profileMiddleSeperator: {
    borderRightColor: 'black',
    borderRightWidth: StyleSheet.hairlineWidth,
    marginVertical: 5,
  },
});
