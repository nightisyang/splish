/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useRef, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  useColorScheme,
  Animated,
  StatusBar,
} from 'react-native';
import {
  Appbar,
  DarkTheme,
  DefaultTheme,
  Provider,
  Surface,
  ThemeProvider,
} from 'react-native-paper';

import Dropdown from './Dropdown';
import ListCards from './ListCards';
import StatusBarTheme from './StatusBarTheme';

const List = ({navigation, passIDToApp}) => {
  const [nightMode, setNightmode] = useState(false);
  const [toggleSearchBar, setToggleSearchBar] = useState(true);
  const [state, setState] = useState('');

  const searchBarAnim = useRef(new Animated.Value(0)).current;

  function setToggleSearchBarHandler(text) {
    // console.log('passed to parent App');
    if (text === 'true') {
      setToggleSearchBar(true);
    } else {
      setToggleSearchBar(false);
    }
  }

  useEffect(() => {
    if (toggleSearchBar) {
      Animated.timing(searchBarAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(searchBarAnim, {
        toValue: -65,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [toggleSearchBar]);

  function filterStateHandler(obj) {
    // Handler function to set filtered state from dropdown
    setState(obj);
  }

  function passingWaterfallIDHandler(id) {
    console.log('ID passed to List:', id);
    passIDToApp(id);
  }

  return (
    <StatusBarTheme style={{zIndex: 1}}>
      <Appbar.Header mode="small" style={{zIndex: 1}}>
        <Appbar.BackAction />
        <Appbar.Content title="Title" />
        <Appbar.Action
          icon={nightMode ? 'brightness-7' : 'brightness-3'}
          onPress={() => setNightmode(!nightMode)}
        />
        <Appbar.Action
          icon="magnify"
          onPress={() => setToggleSearchBar(!toggleSearchBar)}
        />
        <Appbar.Action icon="dots-vertical" />
      </Appbar.Header>
      <Surface style={styles.appContainer}>
        <SafeAreaView>
          <Animated.View
            style={{
              transform: [{translateY: searchBarAnim}],
              paddingHorizontal: 10,
              paddingBottom: 3,
            }}>
            <Dropdown onStateChange={filterStateHandler} />
          </Animated.View>
          <Animated.View
            style={{
              transform: [{translateY: searchBarAnim}],
            }}>
            <ListCards
              passingWaterfallID={passingWaterfallIDHandler}
              onStateChange={state}
              onDrag={setToggleSearchBarHandler}
            />
          </Animated.View>
        </SafeAreaView>
      </Surface>
    </StatusBarTheme>
  );
};

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    // position: 'absolute',
    // flexDirection: 'column',
    backgroundColor: 'grey',
    // alignContent: 'stretch',
    // margin: 20,
  },

  header: {
    // position: 'absolute',
    // right: 0,
    // top: 0,
    // bottom: 0,
    // justifyContent: 'center',
    // alignItems: 'center',
    // paddingHorizontal: 20,
  },

  dropdownContainer: {
    // flex: 1,
    // justifyContent: 'space-between',
    // alignItems: 'center',
    // backgroundColor: 'pink',
    // height: 150,
    // padding: 20,
    // margin: 50,
    // paddingHorizontal: 10,
  },

  listCards: {
    // flex: 2,
  },

  safeContainerStyle: {
    // flex: 1,
    // margin: 10,
    // justifyContent: 'center',
    // alignSelf: 'stretch',
    // backgroundColor: 'green',
  },
});

export default List;
