import React from 'react';
import {SafeAreaView, View} from 'react-native';
import {Text} from 'react-native-paper';

import StatusBarTheme from './StatusBarTheme';

const About = () => {
  return (
    <StatusBarTheme>
      <SafeAreaView style={{flex: 1}}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{backgroundColor: 'pink'}}>About</Text>
        </View>
      </SafeAreaView>
    </StatusBarTheme>
  );
};

export default About;
