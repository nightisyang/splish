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
  View,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import {
  Appbar,
  Text,
  DarkTheme,
  DefaultTheme,
  Provider,
  Surface,
  ThemeProvider,
  Alert,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

import Dropdown from './Dropdown';
import ListCards from './ListCards';
import StatusBarTheme from './StatusBarTheme';
import ModalZoom from './ModalZoom';

const window = Dimensions.get('window');

const List = ({passIDToApp, onScreenChange}) => {
  const [nightMode, setNightmode] = useState(false);
  const [toggleSearchBar, setToggleSearchBar] = useState(true);
  const [state, setState] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [imgArr, setImgArr] = useState(null);
  const [imgStartIndex, setImgStartIndex] = useState(null);

  const searchBarAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  function setToggleSearchBarHandler(text) {
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
        toValue: -70,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [toggleSearchBar]);

  function filterStateHandler(obj) {
    // Handler function to set filtered state from dropdown
    setState(obj);
  }

  function showModalHandler(info) {
    const [_imgArr, urlIndex] = info;
    setModalVisible(true);
    setImgArr(_imgArr);
    setImgStartIndex(_imgArr.indexOf(urlIndex));
  }

  function closeModal() {
    setModalVisible(false);
  }

  return (
    <StatusBarTheme style={{zIndex: 1}}>
      <Surface style={styles.appContainer}>
        <Appbar.Header style={{zIndex: 1}}>
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
            title="Search.."
          />
          {/* <Appbar.Action
          icon={nightMode ? 'brightness-7' : 'brightness-3'}
          onPress={() => setNightmode(!nightMode)}
        /> */}
          <Appbar.Action
            style={{position: 'absolute', right: 10}}
            icon="magnify"
            onPress={() => setToggleSearchBar(!toggleSearchBar)}
          />
          {/* <Appbar.Action icon="dots-vertical" /> */}
        </Appbar.Header>
        <Animated.View
          style={{
            transform: [{translateY: searchBarAnim}],
            paddingHorizontal: 10,
            paddingTop: 2,
            paddingBottom: 3,
            // zIndex: -1,
          }}>
          <Dropdown onStateChange={filterStateHandler} />
        </Animated.View>
        <SafeAreaView>
          <Animated.View style={{transform: [{translateY: searchBarAnim}]}}>
            <View style={styles.listContainer}>
              {state ? (
                <ListCards
                  showModal={showModalHandler}
                  onStateChange={state}
                  onDrag={setToggleSearchBarHandler}
                  onReceivingScreenChange={onScreenChange}
                />
              ) : null}
            </View>
          </Animated.View>
        </SafeAreaView>
        <Modal
          animationType="slide"
          // transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
          presentationStyle={'pageSheet'}>
          <View
            style={{
              flex: 1,
            }}>
            <ModalZoom
              imgUrl={imgArr}
              setModalVisibility={closeModal}
              startWith={imgStartIndex}
            />
          </View>
        </Modal>
        {state ? null : (
          <View
            style={{
              flex: 1,
              // backgroundColor: 'purple',
              justifyContent: 'center',
              alignItems: 'center',
              // alignContent: 'center',
            }}>
            <Text>Please select a state from the list</Text>
          </View>
        )}
      </Surface>
    </StatusBarTheme>
  );
};

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    // position: 'absolute',
    // flexDirection: 'column',
    backgroundColor: '#ECF0F1',
    // alignContent: 'stretch',
    // margin: 20,
  },

  listContainer: {
    // paddingHorizontal: 5,
  },
});

export default List;
