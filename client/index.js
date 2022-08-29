/**
 * @format
 */
import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import * as React from 'react';
import {AppRegistry} from 'react-native';
import {Provider as PaperProvider} from 'react-native-paper';
import {NavigationContainer} from '@react-navigation/native';
import {DarkTheme, DefaultTheme} from 'react-native-paper';

const theme = {
  ...DefaultTheme,
};

import App from './App';
import {name as appName} from './app.json';

export default function Main() {
  return (
    <PaperProvider>
      <NavigationContainer theme={theme}>
        <App />
      </NavigationContainer>
    </PaperProvider>
  );
}

AppRegistry.registerComponent(appName, () => Main);
