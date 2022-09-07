import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  TouchableHighlight,
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
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            // alignContent: 'center',
            // backgroundColor: 'red',
          }}>
          <Icon
            name="SplishLogo"
            height="50"
            width="50"
            viewBox="10 26 180 148"
            stroke="#80DDD9"
            strokeWidth="2"
            // fill="purple"
          />
          <Text
            style={{
              fontFamily: 'FredokaOne-Regular',
              fontSize: 33,
              color: 'white',
              alignSelf: 'center',
              paddingLeft: 10,
            }}>
            splish.
          </Text>
        </View>

        {/* <Appbar.Content titleStyle={{textAlign: 'center'}} title="Home" /> */}
      </Appbar.Header>

      <SafeAreaView
        style={{flex: 1, backgroundColor: DefaultTheme.colors.primary}}>
        <View style={{flex: 1}}>
          <View
            style={{
              flex: 2,
              backgroundColor: DefaultTheme.colors.primary,
              justifyContent: 'center',
              alignContent: 'center',
            }}>
            <ScrollView
              horizontal={true}
              contentContainerStyle={{
                flex: 1,
                justifyContent: 'center',
                // alignContent: 'center',
              }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'yellow',
                  borderRadius: 10,
                  margin: 20,
                  overflow: 'hidden',
                  justifyContent: 'center',
                  // alignItems: 'center',
                }}>
                <View
                  style={{
                    flex: 1,
                    position: 'absolute',
                    zIndex: 1,
                    paddingLeft: 20,
                  }}>
                  <Text
                    style={{
                      fontFamily: 'FredokaOne-Regular',
                      fontSize: 25,
                      color: 'white',
                      textAlign: 'center',
                      backgroundColor: 'green',
                    }}>
                    splish?
                  </Text>
                </View>
                <FastImage
                  style={{width: 'auto', height: 200}}
                  source={{uri: `http://${localhost}/ui/santai.jpeg`}}
                  resizeMode={FastImage.resizeMode.cover}
                />
              </View>
            </ScrollView>
          </View>
          <View
            style={{
              //   flex: 2,
              height: 130,
              backgroundColor: DefaultTheme.colors.background,
              borderRadius: 20,
              marginHorizontal: 5,
            }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: '700',
                paddingLeft: 15,
                paddingTop: 5,
                paddingBottom: 5,
              }}>
              Activity
            </Text>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-evenly',
              }}>
              <TouchableHighlight
                style={{
                  height: 80,
                  width: 80,
                  borderRadius: 10,
                  overflow: 'hidden',
                }}
                onPress={() => {
                  navigation.navigate('Waterfalls');
                }}>
                <View style={{alignItems: 'center'}}>
                  <FastImage
                    style={{width: 80, height: 80}}
                    source={{uri: `http://${localhost}/ui/home_waterfall.gif`}}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                  <Text
                    style={{
                      zIndex: 1,
                      color: 'white',
                      //   backgroundColor: 'purple',
                      position: 'absolute',
                      bottom: 0,
                      textAlign: 'center',
                    }}>
                    Waterfalls
                  </Text>
                </View>
              </TouchableHighlight>
              <View
                style={{
                  height: 80,
                  width: 80,
                  backgroundColor: 'grey',
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <MaterialCommunityIcons name="tools" size={50} />
                <Text>Trails</Text>
              </View>

              <View
                style={{
                  height: 80,
                  width: 80,
                  backgroundColor: 'grey',
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <MaterialCommunityIcons name="tools" size={50} />

                <Text>Camp</Text>
              </View>

              <View
                style={{
                  height: 80,
                  width: 80,
                  backgroundColor: 'grey',
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <MaterialCommunityIcons name="tools" size={50} />
                <Text>Adventures</Text>
              </View>
            </View>
          </View>
          <View
            style={{
              flex: 3,
              backgroundColor: DefaultTheme.colors.primary,
            }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: '700',
                paddingTop: 10,
                paddingLeft: 15,
                color: 'white',
                marginBottom: -10,
              }}>
              Featured
            </Text>
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
        </View>
      </SafeAreaView>
    </StatusBarTheme>
  );
};

export default Home;
