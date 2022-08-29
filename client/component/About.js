import React from 'react';
import {SafeAreaView, View} from 'react-native';
import {Appbar, Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

import StatusBarTheme from './StatusBarTheme';

const About = () => {
  const navigation = useNavigation();

  return (
    <StatusBarTheme>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="About" />
        {/* <Appbar.Action /> */}
        {/* <Appbar.Action icon="magnify" /> */}
        {/* <Appbar.Action icon="dots-vertical" /> */}
      </Appbar.Header>

      <SafeAreaView style={{flex: 1}}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{backgroundColor: 'pink'}}>About</Text>
        </View>
      </SafeAreaView>
    </StatusBarTheme>
  );
};

export default About;
