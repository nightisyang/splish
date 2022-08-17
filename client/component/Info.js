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
import MapComponent from './MapComponent';
import MapIDState from './MapIDState';

let localhost = '192.168.101.24:3000';

// if (Platform.OS === 'ios') {
//   localhost = '127.0.0.1:3000';
// } else {
//   localhost = '10.0.2.2:3000';
// }

let viewHeight;
let calcWidth = Dimensions.get('window').width;
const halfcalcWidth = calcWidth / 2;
let screenIndex = 0;

const LATITUD_DELTA = 0.2;
let LONGITUDE_DELTA;
LONGITUDE_DELTA = LATITUD_DELTA * (calcWidth / 250);
let locLat;
let locLng;

const Info = ({onRoute, navigate}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [onLayoutReady, setLayoutReady] = useState(false);
  const mapRef = useRef(null);
  const [isMapReady, setMapReady] = useState(false);
  const scrollRef = useRef(null);
  const [waterfall, setWaterfall] = useState(null);
  const [waterfallID, setWaterfallID] = useState('');

  useEffect(() => {
    console.log(onRoute);
    console.log(`route: ${onRoute?.params?.waterfallID}`);
    setWaterfallID(onRoute?.params?.waterfallID);
  }, [onRoute]);

  async function getWaterfall() {
    try {
      // fetching json from API
      let response;

      response = await fetch(
        `http://${localhost}/api/v1/waterfalls/${waterfallID}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json', // I added this line
          },
          // body: JSON.stringify(data),
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

      const [arrLat, arrLng] = info.coordinate;

      locLat = arrLat;
      locLng = arrLng;

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

  const region = {
    latitude: locLat,
    longitude: locLng,
    latitudeDelta: 0.5,
    longitudeDelta: LONGITUDE_DELTA,
  };

  const animateTo = {
    latitude: locLat,
    longitude: locLng,
    latitudeDelta: LATITUD_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  };

  const onLayoutImage = event => {
    const {height} = event.nativeEvent.layout;
    viewHeight = Math.floor(height);
    console.log('viewHeight:', viewHeight);
    setLayoutReady(true);
  };

  const scrollNext = () => {
    console.log('Next', screenIndex);
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
    console.log('Prev', screenIndex);
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

  useEffect(() => {
    console.log(waterfallID);
  });

  return (
    <StatusBarTheme>
      <Appbar.Header>
        <Appbar.BackAction />
        <Appbar.Content title="Title" />
        <Appbar.Action />
        <Appbar.Action icon="magnify" />
        <Appbar.Action icon="dots-vertical" />
      </Appbar.Header>
      {isLoaded ? (
        <SafeAreaView style={styles.container}>
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
              <View
                style={{
                  flex: 1,
                  width: calcWidth,
                  height: '100%',
                  backgroundColor: 'purple',
                }}>
                <MapComponent
                  type={'info'}
                  regionInput={region}
                  animateToInput={animateTo}
                  styleInput={{
                    flex: 1,
                  }}
                  coordInput={{latitude: locLat, longitude: locLng}}
                  zoomLevelInput={6}
                  liteModeInput={false}
                />
              </View>
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
              <View style={[styles.flexRow, {paddingTop: 5}]}>
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
                      <Text style={styles.profileTextTitle}>Water source</Text>
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
              <View style={styles.spacing} />
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.descriptionContent}>
                {waterfall.description}
              </Text>
            </ScrollView>
          </View>
        </SafeAreaView>
      ) : (
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </SafeAreaView>
      )}
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
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    // flex: 1,
    // width: '100%',
    // height: '100%',
    // backgroundColor: 'black',
    // position: 'absolute',
    width: Dimensions.get('window').width,
    // height: Dimensions.get('window').height,
    // flex: 1,
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
    alignSelf: 'center',
    zIndex: 1,
    left: 0,
    // width: 50,
    // height: '100%',
    // backgroundColor: 'purple',
  },

  arrowRight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    alignSelf: 'center',
    position: 'absolute',
    zIndex: 1,
    right: 0,
    // width: 50,
    // height: '100%',
    // backgroundColor: 'purple',
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
    paddingBottom: 5,
  },

  descriptionContent: {
    textAlign: 'justify',
  },

  spacing: {
    padding: 5,
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
