import React, {Component, useEffect, useState} from 'react';
import {View, StatusBar, Platform} from 'react-native';
import {
  DarkTheme,
  DefaultTheme,
  Provider,
  ThemeProvider,
} from 'react-native-paper';

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight;
const HEADER_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

const StatusBarTheme = ({children}) => {
  const [nightMode, setNightmode] = useState(false);
  const [colorsPrimary, setColorsPrimary] = useState(DarkTheme.colors.surface);

  useEffect(() => {
    setColorsPrimary(
      nightMode ? DarkTheme.colors.surface : DefaultTheme.colors.primary,
    );
  }, [nightMode]);

  //   console.log(
  //     Platform.OS,
  //     `STATUS_BAR_HEIGHT: ${STATUS_BAR_HEIGHT}`,
  //     `HEADER HEIGHT: ${HEADER_HEIGHT}`,
  //   );

  return (
    <Provider theme={nightMode ? DarkTheme : DefaultTheme}>
      <ThemeProvider theme={nightMode ? DarkTheme : DefaultTheme}>
        <View style={{flex: 1}}>
          <View
            style={{height: STATUS_BAR_HEIGHT, backgroundColor: colorsPrimary}}>
            <StatusBar
              translucent
              backgroundColor={colorsPrimary}
              barStyle="light-content"
            />
          </View>
          {/* <View
            style={{backgroundColor: colorsPrimary, height: HEADER_HEIGHT}}
          /> */}
          <View style={{flex: 1, backgroundColor: '#33373B'}}>{children}</View>
        </View>
      </ThemeProvider>
    </Provider>
  );
};

export default StatusBarTheme;
