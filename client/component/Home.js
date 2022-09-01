import React from 'react';
import {SafeAreaView, View, Text} from 'react-native';
import {Appbar, Text as RNPaperText} from 'react-native-paper';

import StatusBarTheme from './StatusBarTheme';

import Icon from './Icon';

const Home = () => {
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
          <RNPaperText
            style={{
              fontFamily: 'FredokaOne-Regular',
              fontSize: 30,
              color: 'white',
              alignSelf: 'center',
              paddingLeft: 10,
            }}>
            splish.
          </RNPaperText>
        </View>

        {/* <Appbar.Content titleStyle={{textAlign: 'center'}} title="Home" /> */}
      </Appbar.Header>

      <SafeAreaView style={{flex: 1, backgroundColor: '#ECF0F1'}}>
        <View style={{flex: 1}}>
          <RNPaperText>Hello</RNPaperText>
        </View>

        <View></View>
      </SafeAreaView>
    </StatusBarTheme>
  );
};

export default Home;
