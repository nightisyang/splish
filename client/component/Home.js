import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import {Appbar, Text} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';
import {DefaultTheme} from 'react-native-paper';

import StatusBarTheme from './StatusBarTheme';
import Icon from './Icon';
import Card from './Card';

let localhost = '192.168.101.24:3000';

const Home = () => {
  const navigation = useNavigation();

  function cardClickHandler(uri) {
    console.log('press');
  }

  return (
    <StatusBarTheme>
      <Appbar.Header>
        <View style={styles.iconContainer}>
          <Icon
            name="SplishLogo"
            height="50"
            width="50"
            viewBox="10 26 180 148"
            stroke="#80DDD9"
            strokeWidth="2"
          />
          <Text style={styles.textTitleStyle}>splish.</Text>
        </View>
      </Appbar.Header>

      <SafeAreaView style={styles.screenContainer}>
        <View style={styles.scrollViewContainer}>
          <ScrollView
            horizontal={true}
            contentContainerStyle={styles.scrollViewStyle}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                navigation.navigate('About');
              }}
              style={styles.aboutScreenJumpContainer}>
              <View style={styles.splishTextContainer}>
                <Text style={styles.splishTextStyle}>splish?</Text>
              </View>
              <FastImage
                style={styles.scrollImgStyle}
                source={{uri: `http://${localhost}/ui/santai.jpeg`}}
                resizeMode={FastImage.resizeMode.cover}
              />
            </TouchableOpacity>
          </ScrollView>
        </View>
        <View style={styles.activityContainer}>
          <Text style={styles.activityTitleText}>Activity</Text>
          <View style={styles.activityIconContainer}>
            <TouchableHighlight
              style={styles.activityIconStyle}
              onPress={() => {
                navigation.navigate('Waterfalls');
              }}>
              <View style={styles.viewFragStyle}>
                <FastImage
                  style={styles.gifIconStyle}
                  source={{uri: `http://${localhost}/ui/home_waterfall.gif`}}
                  resizeMode={FastImage.resizeMode.cover}
                />
                <Text style={styles.activityTextStyle}>Waterfalls</Text>
              </View>
            </TouchableHighlight>
            <View style={[styles.activityIconStyle, styles.tempIconBackgound]}>
              <MaterialCommunityIcons name="tools" size={50} />
              <Text>Trails</Text>
            </View>

            <View style={[styles.activityIconStyle, styles.tempIconBackgound]}>
              <MaterialCommunityIcons name="tools" size={50} />

              <Text>Camp</Text>
            </View>

            <View style={[styles.activityIconStyle, styles.tempIconBackgound]}>
              <MaterialCommunityIcons name="tools" size={50} />
              <Text>Adventures</Text>
            </View>
          </View>
        </View>
        <View style={styles.featuredContainer}>
          <Text style={styles.featuredTextStyle}>Featured</Text>
          <Card
            onCardClick={cardClickHandler}
            id={'62e257d0a55e10ce13603aa6'}
            name={'Usun Apau'}
            imgArr={[
              {
                uri: 'http://192.168.101.24:3000/images/kotak_telangusan.JPG',
              },
              {
                uri: 'http://192.168.101.24:3000/images/selio_telangusan-1.jpg',
              },
              {uri: 'http://192.168.101.24:3000/images/usun_apau.JPG'},
              {uri: 'http://192.168.101.24:3000/images/western_julan.jpg'},
              {uri: 'http://192.168.101.24:3000/images/eastern_julan.jpg'},
              {
                uri: 'http://192.168.101.24:3000/images/Julan_eastern_danny.jpg',
              },
              {
                uri: 'http://192.168.101.24:3000/images/Julan_eastern_ash.jpg',
              },
              {
                uri: 'http://192.168.101.24:3000/images/julan_jee_mui_lan.jpg',
              },
              {uri: 'http://192.168.101.24:3000/images/selio_GE.JPG'},
              {
                uri: 'http://192.168.101.24:3000/images/lower_selio_telangusan.JPG',
              },
              {uri: 'http://192.168.101.24:3000/images/Julan_GE.JPG'},
              {
                uri: 'http://192.168.101.24:3000/images/eastern_julan_upper.jpg',
              },
              {uri: 'http://192.168.101.24:3000/images/julan_Topo.JPG'},
              {
                uri: 'http://192.168.101.24:3000/images/julan_hazebroek.JPG',
              },
              {uri: 'http://192.168.101.24:3000/images/IMG_9408_Chua.JPG'},
            ]}
            desc={
              'Remote waterfalls with difficult access. The Julan fall is the tallest fall of Sarawak'
            }
          />
        </View>
      </SafeAreaView>
    </StatusBarTheme>
  );
};

const styles = StyleSheet.create({
  iconContainer: {flex: 1, flexDirection: 'row', justifyContent: 'center'},
  textTitleStyle: {
    fontFamily: 'FredokaOne-Regular',
    fontSize: 33,
    color: 'white',
    alignSelf: 'center',
    paddingLeft: 10,
  },
  screenContainer: {flex: 1, backgroundColor: DefaultTheme.colors.primary},
  scrollViewContainer: {
    flex: 2,
    backgroundColor: DefaultTheme.colors.primary,
    justifyContent: 'center',
    alignContent: 'center',
  },
  scrollViewStyle: {flex: 1, justifyContent: 'center'},
  aboutScreenJumpContainer: {
    flex: 1,
    backgroundColor: 'yellow',
    borderRadius: 10,
    margin: 20,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  splishTextContainer: {
    flex: 1,
    position: 'absolute',
    zIndex: 1,
    paddingLeft: 20,
  },
  splishTextStyle: {
    fontFamily: 'FredokaOne-Regular',
    fontSize: 25,
    color: 'white',
    textAlign: 'center',
    backgroundColor: 'green',
  },
  scrollImgStyle: {width: 'auto', height: 200},
  activityContainer: {
    height: 130,
    backgroundColor: DefaultTheme.colors.background,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  activityTitleText: {
    fontSize: 22,
    fontWeight: '700',
    paddingLeft: 15,
    paddingTop: 5,
    paddingBottom: 5,
  },
  activityIconContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  activityIconStyle: {
    height: 80,
    width: 80,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewFragStyle: {alignItems: 'center'},
  gifIconStyle: {width: 80, height: 80},
  activityTextStyle: {
    color: 'white',
    position: 'absolute',
    bottom: 5,
  },
  tempIconBackgound: {backgroundColor: 'grey'},
  featuredContainer: {flex: 3, backgroundColor: DefaultTheme.colors.primary},
  featuredTextStyle: {
    fontSize: 22,
    fontWeight: '700',
    paddingTop: 10,
    paddingLeft: 15,
    color: 'white',
    marginBottom: -10,
  },
});

export default Home;
