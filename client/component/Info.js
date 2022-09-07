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

let localhost = '192.168.101.24:3000';

// if (Platform.OS === 'ios') {
//   localhost = '127.0.0.1:3000';
// } else {
//   localhost = '10.0.2.2:3000';
// }

let calcWidth = Dimensions.get('window').width;
const halfcalcWidth = calcWidth / 2;

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
  const screenIndex = useRef(0);
  const viewHeight = useRef(null);
  const viewWidth = useRef(null);
  const [waterfall, setWaterfall] = useState(null);
  const [waterfallID, setWaterfallID] = useState('');
  const [latlng, setLatLng] = useState('');
  const [distance, setDistance] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [imgLength, setImgLength] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [imgArr, setImgArr] = useState(null);
  const [imgStartIndex, setImgStartIndex] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    // if no params recieved return immediately
    if (!onRoute.params) {
      return;
    }

    setWaterfallID(onRoute?.params?.waterfallID);

    if (onRoute.params.userLoc) {
      setLatLng(
        `${onRoute?.params?.userLoc?.latitude},${onRoute?.params?.userLoc?.longitude}`,
      );
    }

    screenIndex.current = 0;
    scrollRef.current?.scrollTo({
      x: 0,
    });
  }, [onRoute]);

  useEffect(() => {
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

      info.imgFilenameArr = val.imgDetails.imgFullResFilename.map(
        imgFilename => {
          const obj = {};
          obj.uri = `http://${localhost}/images/${imgFilename}`;
          // obj.height = 140;

          return obj;
        },
      );

      setImgLength(info.imgFilenameArr.length);
      setDistance(json.data.distance);
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
    if (!viewHeight.current) {
      const {height, width} = event.nativeEvent.layout;
      viewHeight.current = height;
      viewWidth.current = width;
    }
    setLayoutReady(true);
  };

  const scrollNext = () => {
    if (screenIndex.current < imgLength) {
      screenIndex.current += 1;
      scrollRef.current?.scrollTo({
        x: viewWidth.current * screenIndex.current,
        animated: true,
      });
    }
  };

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
          style={{
            marginLeft: 0,
            position: 'absolute',
            left: 0,
            right: 0,
            zIndex: -1,
          }}
          titleStyle={{textAlign: 'center'}}
          title="Info"
        />
        {/* <Appbar.Action /> */}
        {/* <Appbar.Action icon="magnify" /> */}
        {/* <Appbar.Action icon="dots-vertical" /> */}
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
                  // backgroundColor: 'purple',
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
              <View style={[styles.flexRow, {paddingTop: 5}]}>
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
        <SafeAreaView style={styles.container}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignSelf: 'center',
              position: 'absolute',
              height: '85%',
              width: '85%',
              marginTop: 150,
            }}>
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
            {/* <Text style={styles.loadingText}>Loading...</Text> */}
            <Text style={styles.loadingText}>
              Select a waterfall from the {''}
              <Text
                style={{color: 'blue', textDecorationLine: 'underline'}}
                onPress={() => {
                  navigation.navigate('Map');
                }}>
                Map
              </Text>{' '}
              or {''}
              <Text
                style={{color: 'blue', textDecorationLine: 'underline'}}
                onPress={() => {
                  navigation.navigate('Waterfalls');
                }}>
                List
              </Text>
              !
            </Text>
          </View>
        </SafeAreaView>
      )}
      <Modal
        animationType="slide"
        // transparent={true}
        visible={modalVisible}
        presentationStyle={'pageSheet'}
        onRequestClose={closeModal}>
        <View
          style={{
            flex: 1,
            // backgroundColor: 'purple',
          }}>
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
    // flex: 2,
    alignContent: 'center',
    // paddingBottom: 5,
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
    // alignContent: 'center',
    // justifyContent: 'flex-start',
    // backgroundColor: 'red',
    // marginBottom: 20,
  },

  subheadingIcon: {
    alignSelf: 'center',
    marginBottom: 12,
  },

  subheadingText: {
    alignSelf: 'center',
    marginLeft: -15,
    // paddingBottom: 3,
    // backgroundColor: 'purple',
  },

  mediaContainer: {
    flex: 9,
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 10,
    borderRadius: 10,
    // borderWidth: 5,
    overflow: 'hidden',
    shadowRadius: 10,
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
    // paddingVertical: 2,
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
});
