import React from 'react';
import {useState, useRef, useCallback, useEffect} from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
  Platform,
} from 'react-native';
import {PROVIDER_GOOGLE} from 'react-native-maps';
import {Appbar, IconButton, Text} from 'react-native-paper';
import FastImage from 'react-native-fast-image';

import StatusBarTheme from './StatusBarTheme';
import MapView, {Marker} from 'react-native-maps';

let localhost;

if (Platform.OS === 'ios') {
  localhost = '127.0.0.1:3000';
} else {
  localhost = '10.0.2.2:3000';
}

let viewHeight;
let calcWidth = Dimensions.get('window').width;
const halfcalcWidth = calcWidth / 2;
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

const Info = ({navigation, waterfallID}) => {
  const [isMapReady, setMapReady] = useState(false);
  // const [screenIndex, setScreenIndex] = useState(1);
  const mapRef = useRef(null);
  const scrollRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [waterfall, setWaterfall] = useState(null);

  async function getWaterfall() {
    try {
      // fetching json from API
      let response;

      response = await fetch(
        `http://${localhost}/api/v1/waterfalls/${waterfallID}`,
        {
          method: 'GET',
        },
      );

      // resolving json
      const json = await response.json();

      const val = json.data.waterfall;
      const info = {};

      // const extractInfo = json.data.waterfall.map((val, i, arr) => {

      info.name = val.name;
      info.description = val.description;
      info.state = val.state;
      info.coordinate = val.location.coordinates;
      info.waterSource = val.waterSource;
      info.waterfallProfile = val.waterfallProfile;
      info.accessibility = val.accessibility;
      info.lastUpdate = val.lastUpdate;
      info.difficulty = val.difficulty;

      info.imgFilenameArr = val.imgDetails.imgFullResFilename.map(
        imgFilename => {
          const obj = {};
          obj.uri = `http://${localhost}/images/${imgFilename}`;
          // obj.height = 140;

          return obj;
        },
      );
      // console.log(info);

      // return info;
      // });

      setWaterfall(info);
      setIsLoaded(true);
    } catch (err) {
      console.log(err);
    }
  }

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
  };

  const scrollPrev = () => {
    if (screenIndex > 0) {
      scrollRef.current?.scrollTo({
        x: calcWidth * (screenIndex - 1),
        animated: true,
      });
      screenIndex -= 1;
    }
  };

  useEffect(() => {
    getWaterfall();
    console.log('retriving waterfall');
  }, [waterfallID]);

  return (
    <StatusBarTheme>
      <Appbar.Header>
        <Appbar.BackAction />
        <Appbar.Content title="Title" />
        <Appbar.Action />
        <Appbar.Action icon="magnify" />
        <Appbar.Action icon="dots-vertical" />
      </Appbar.Header>
      <SafeAreaView style={styles.container}>
        {isLoaded ? (
          <>
            <View style={styles.headerContainer}>
              <Text style={styles.headerText}>{waterfall.name}</Text>
              <View style={styles.subheadingContainer}>
                <IconButton icon="map-marker" style={styles.subheadingIcon} />
                <Text style={styles.subheadingText}>
                  {waterfall.disctrict} {waterfall.state}
                </Text>
              </View>
            </View>
            <View style={styles.mediaContainer}>
              <Pressable
                style={styles.arrowLeft}
                onPress={() => {
                  scrollPrev();
                }}>
                <IconButton icon="chevron-left" style={styles.arrow} />
              </Pressable>

              <Pressable
                style={styles.arrowRight}
                onPress={() => {
                  scrollNext();
                }}>
                <IconButton icon="chevron-right" style={styles.arrow} />
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
                  style={
                    isMapReady ? {...{width: calcWidth, height: '100%'}} : {}
                  }
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
                  <Marker
                    coordinate={{latitude: 5.742, longitude: 102.37567}}
                  />
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
              <ScrollView>
                <Text style={styles.descriptionTitle}>Description</Text>
                <Text style={styles.descriptionContent}>
                  {waterfall.description}
                </Text>
                <View style={styles.spacing} />
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
                        <Text style={styles.profileTextTitle}>
                          Accessibility
                        </Text>
                        <Text style={styles.profileTextContent}>
                          {waterfall.accessibility}
                        </Text>
                      </View>
                      <View style={styles.profileMiddleSeperator} />
                    </View>
                    <View style={styles.profileBottomSeperator}>
                      <View style={styles.flex}>
                        <Text style={styles.profileTextTitle}>Difficulty</Text>
                        <Text style={styles.profileTextContent}>
                          {waterfall.difficulty}
                        </Text>
                      </View>
                      <View style={styles.profileMiddleSeperator} />
                    </View>
                  </View>
                  <View style={styles.flex}>
                    <View style={styles.profileBottomSeperator}>
                      <View style={styles.flex}>
                        <Text style={styles.profileTextTitle}>
                          Waterfall Profile
                        </Text>
                        <Text style={styles.profileTextContent}>
                          {waterfall.waterfallProfile}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.profileBottomSeperator}>
                      <View style={styles.flex}>
                        <Text style={styles.profileTextTitle}>
                          Water source
                        </Text>
                        <Text style={styles.profileTextContent}>
                          {waterfall.waterSource}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.profileBottomSeperator}>
                      <View style={styles.flex}>
                        <Text style={styles.profileTextTitle}>Last update</Text>
                        <Text style={styles.profileTextContent}>
                          {waterfall.lastUpdate}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </>
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    textAlignVertical: 'center',
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
    flexDirection: 'row',
    justifyContent: 'center',
  },

  arrowLeft: {
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 1,
    left: 0,
    width: halfcalcWidth,
    height: '100%',
  },

  arrowRight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    position: 'absolute',
    zIndex: 1,
    right: 0,
    width: halfcalcWidth,
    height: '100%',
  },

  arrow: {
    backgroundColor: '#CBDCCB',
  },

  image: {
    backgroundColor: 'black',
  },

  descriptionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },

  descriptionContent: {
    textAlign: 'justify',
  },

  spacing: {
    padding: 10,
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
