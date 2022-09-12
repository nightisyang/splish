import React from 'react';
import {useState, useRef, useEffect} from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
  Modal,
} from 'react-native';
import {Appbar, IconButton, Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

import StatusBarTheme from './StatusBarTheme';
import MapComponent from './MapComponent';
import FetchImages from './FetchImages';
import ModalZoom from './ModalZoom';
import Icon from './Icon';
import configData from '../config.json';

let localhost = configData.API_URL;

let calcWidth = Dimensions.get('window').width;

const LATITUD_DELTA = 0.2;
let LONGITUDE_DELTA;
LONGITUDE_DELTA = LATITUD_DELTA * (calcWidth / 250);
let locLat;
let locLng;

const Info = ({onRoute, navigate}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [onLayoutReady, setLayoutReady] = useState(false);
  const scrollRef = useRef(null);
  const screenIndex = useRef(0);
  const viewHeight = useRef(null);
  const viewWidth = useRef(null);
  const [waterfall, setWaterfall] = useState(null);
  const [waterfallID, setWaterfallID] = useState('');
  const [latlng, setLatLng] = useState('');
  const [distance, setDistance] = useState('');
  const [imgLength, setImgLength] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [imgArr, setImgArr] = useState(null);
  const [imgStartIndex, setImgStartIndex] = useState(null);

  const navigation = useNavigation();

  // update state when new params recieved though navigation route
  useEffect(() => {
    // if no params recieved return immediately
    if (!onRoute.params) {
      return;
    }

    // set ID and rerender component
    setWaterfallID(onRoute?.params?.waterfallID);

    // if user location is available in params, update state
    if (onRoute.params.userLoc) {
      setLatLng(
        `${onRoute?.params?.userLoc?.latitude},${onRoute?.params?.userLoc?.longitude}`,
      );
    }

    // reset screenIndex (image scrollview) when new params/waterfall recieved
    screenIndex.current = 0;

    // scroll back to top when new params/waterfall recieved
    scrollRef.current?.scrollTo({
      x: 0,
      animate: true,
    });
  }, [onRoute]);

  // when new waterfallID is recieved
  useEffect(() => {
    // call async getWaterfall function to call API
    if (!onRoute.params) {
      // console.log('no route params received.');
      return;
    } else {
      getWaterfall();
      // console.log('retriving waterfall');
    }
  }, [waterfallID]);

  function closeModal() {
    setModalVisible(false);
  }

  async function getWaterfall() {
    try {
      // fetching json from API
      let response;

      response = await fetch(
        `http://${localhost}/api/v1/waterfalls/${waterfallID}/${latlng}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );

      // resolving json
      const json = await response.json();

      const val = json.data.waterfall;
      const info = {};

      // reassign key to be more descriptive and store necessary info to be displayed
      info.name = val.name;
      info.description = val.description;
      info.state = val.state;
      info.coordinate = val.location.coordinates;
      info.waterSource = val.waterSource;
      info.waterfallProfile = val.waterfallProfile;
      info.accessibility = val.accessibility;
      info.lastUpdate = val.lastUpdate;
      info.difficulty = val.difficulty;

      const [arrLng, arrLat] = info.coordinate;

      locLat = arrLat;
      locLng = arrLng;

      // restructure obj to be used in FetchImage returns obj and assigned to imgFilenameArr
      info.imgFilenameArr = val.imgDetails.imgFullResFilename.map(
        imgFilename => {
          const obj = {};
          obj.uri = `http://${localhost}/images/${imgFilename}`;

          return obj;
        },
      );

      // sets the total number of image for scroll view
      setImgLength(info.imgFilenameArr.length);

      // sets distance of user to location - value called from API
      setDistance(json.data.distance);

      // places all values required by UI in state
      setWaterfall(info);

      // sets loaded is true, to re-render page when info for UI is ready/in state
      setIsLoaded(true);
    } catch (err) {
      console.log(err);
    }
  }

  // specifies region for MapComponent
  const region = {
    latitude: locLat,
    longitude: locLng,
    latitudeDelta: 0.5,
    longitudeDelta: LONGITUDE_DELTA,
  };

  // specifies animation location for MapComponent
  const animateTo = {
    latitude: locLat,
    longitude: locLng,
    latitudeDelta: LATITUD_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  };

  // sets width and length of ScrollView
  const onLayoutImage = event => {
    if (!viewHeight.current) {
      const {height, width} = event.nativeEvent.layout;
      viewHeight.current = height;
      viewWidth.current = width;
    }
    setLayoutReady(true);
  };

  // scroll to next image for scroll view
  const scrollNext = () => {
    if (screenIndex.current < imgLength) {
      screenIndex.current += 1;
      scrollRef.current?.scrollTo({
        x: viewWidth.current * screenIndex.current,
        animated: true,
      });
    }
  };

  // scroll to previous image for scroll view
  const scrollPrev = () => {
    if (screenIndex.current > 0) {
      scrollRef.current?.scrollTo({
        x: viewWidth.current * (screenIndex.current - 1),
        animated: true,
      });
      screenIndex.current -= 1;
    }
  };

  return (
    <StatusBarTheme>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          style={styles.appBarTitle}
          titleStyle={{textAlign: 'center'}}
          title="Info"
        />
      </Appbar.Header>
      {isLoaded ? (
        <SafeAreaView style={styles.container}>
          <View style={styles.headerContainer}>
            <Text
              style={styles.headerText}
              adjustsFontSizeToFit={true}
              numberOfLines={1}>
              {waterfall.name}
            </Text>
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
              onLayout={onLayoutImage}
              onMomentumScrollEnd={event => {
                let contentOffset = event.nativeEvent.contentOffset.x;
                screenIndex.current = contentOffset / viewWidth.current;
              }}>
              <View
                style={{
                  flex: 1,
                  width: viewWidth.current,
                  height: '100%',
                }}>
                <MapComponent
                  type={'info'}
                  regionInput={region}
                  animateToInput={animateTo}
                  styleInput={styles.flex}
                  coordInput={{latitude: locLat, longitude: locLng}}
                  zoomLevelInput={6}
                  liteModeInput={false}
                  showsUserLocationInput={false}
                />
              </View>
              {onLayoutReady &&
                waterfall.imgFilenameArr.map((val, i, arr) => {
                  return (
                    <View
                      style={[
                        styles.flex,
                        {width: viewWidth.current, height: '100%'},
                      ]}
                      key={i.toString()}>
                      <FetchImages
                        reqSource={'info'}
                        item={val}
                        onPress={() => {
                          // setSelectedId(i);
                          setModalVisible(true);
                          setImgArr(waterfall.imgFilenameArr);
                          setImgStartIndex(i);
                        }}
                        containerHeight={viewHeight.current}
                      />
                    </View>
                  );
                })}
            </ScrollView>
          </View>

          <View style={styles.detailsContainer}>
            <ScrollView>
              <View style={styles.flexRow}>
                <View style={styles.flex}>
                  <View style={styles.profileBottomSeperator}>
                    <View style={styles.detailsTextContainer}>
                      <Text style={styles.profileTextTitle}>Distance</Text>
                      <Text style={styles.profileTextContent}>
                        {!distance ? 'N/A - select from Map' : `${distance} km`}
                      </Text>
                    </View>
                    <View style={styles.profileMiddleSeperator} />
                    <View style={styles.detailsTextContainer}>
                      <Text style={styles.profileTextTitle}>
                        Waterfall Profile
                      </Text>
                      <Text style={styles.profileTextContent}>
                        {waterfall.waterfallProfile}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.profileBottomSeperator}>
                    <View style={styles.detailsTextContainer}>
                      <Text style={styles.profileTextTitle}>Accessibility</Text>
                      <Text style={styles.profileTextContent}>
                        {waterfall.accessibility}
                      </Text>
                    </View>
                    <View style={styles.profileMiddleSeperator} />
                    <View style={styles.detailsTextContainer}>
                      <Text style={styles.profileTextTitle}>Water source</Text>
                      <Text style={styles.profileTextContent}>
                        {waterfall.waterSource}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.profileBottomSeperator}>
                    <View style={styles.detailsTextContainer}>
                      <Text style={styles.profileTextTitle}>Difficulty</Text>
                      <Text style={styles.profileTextContent}>
                        {waterfall.difficulty}
                      </Text>
                    </View>
                    <View style={styles.profileMiddleSeperator} />
                    <View style={styles.detailsTextContainer}>
                      <Text style={styles.profileTextTitle}>Last update</Text>
                      <Text
                        style={styles.profileTextContent}
                        textAlign={'center'}>
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
        <View style={styles.container}>
          <View style={styles.backgroundLogoContainer}>
            <Icon
              name="SplishLogo"
              height="100%"
              width="100%"
              viewBox="10 26 180 148"
              stroke="#80DDD9"
              strokeWidth="4"
              style={{opacity: 0.6}}
              fill="#80DDD9"
            />
          </View>
          <View style={styles.loadingContainer}>
            <Text>
              Select a waterfall from the {''}
              <Text
                style={styles.screenNavigateLinkHighlight}
                onPress={() => {
                  navigation.navigate('Map');
                }}>
                Map
              </Text>{' '}
              or {''}
              <Text
                style={styles.screenNavigateLinkHighlight}
                onPress={() => {
                  navigation.navigate('Waterfalls');
                }}>
                List
              </Text>
              !
            </Text>
          </View>
        </View>
      )}
      <Modal
        animationType="slide"
        // transparent={true}
        visible={modalVisible}
        presentationStyle={'pageSheet'}
        onRequestClose={closeModal}>
        <View style={styles.flex}>
          <ModalZoom
            imgUrl={imgArr}
            setModalVisibility={closeModal}
            startWith={imgStartIndex}
          />
        </View>
      </Modal>
    </StatusBarTheme>
  );
};

export default Info;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECF0F1',
  },

  appBarTitle: {
    marginLeft: 0,
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: -1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  screenNavigateLinkHighlight: {
    color: 'blue',
    textDecorationLine: 'underline',
  },

  flex: {
    flex: 1,
  },

  flexRow: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 5,
  },

  map: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    width: Dimensions.get('window').width,
  },

  headerContainer: {
    alignContent: 'center',
    height: 65,
  },

  headerText: {
    width: Dimensions.get('window').width,
    paddingHorizontal: 15,
    fontWeight: '600',
    fontSize: 30,
  },

  subheadingContainer: {
    paddingTop: 3,
    flex: 1,
    flexDirection: 'row',
  },

  subheadingIcon: {
    alignSelf: 'center',
    marginBottom: 12,
  },

  subheadingText: {
    alignSelf: 'center',
    marginLeft: -15,
  },

  mediaContainer: {
    flex: 9,
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 10,
    borderRadius: 10,
    overflow: 'hidden',
    shadowRadius: 10,
  },

  arrowLeft: {
    justifyContent: 'center',
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 1,
    left: 0,
  },

  arrowRight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    alignSelf: 'center',
    position: 'absolute',
    zIndex: 1,
    right: 0,
  },

  arrow: {
    backgroundColor: '#CBDCCB',
  },

  image: {
    flex: 1,
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

  detailsTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileTextTitle: {
    fontSize: 12,
    alignSelf: 'center',
  },

  profileTextContent: {
    fontSize: 16,
    paddingVertical: 2,
    textAlign: 'center',
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

  backgroundLogoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'absolute',
    height: '85%',
    width: '85%',
    marginTop: 150,
  },
});
