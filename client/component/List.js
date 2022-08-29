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

import Dropdown from './Dropdown';
import ListCards from './ListCards';
import StatusBarTheme from './StatusBarTheme';
import ModalZoom from './ModalZoom';

const window = Dimensions.get('window');

const List = ({passIDToApp}) => {
  const [nightMode, setNightmode] = useState(false);
  const [toggleSearchBar, setToggleSearchBar] = useState(true);
  const [state, setState] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [imgArr, setImgArr] = useState(null);
  const [imgStartIndex, setImgStartIndex] = useState(null);

  const searchBarAnim = useRef(new Animated.Value(0)).current;

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
          {/* <Appbar.BackAction /> */}
          <Appbar.Content title="Search.." />
          {/* <Appbar.Action
          icon={nightMode ? 'brightness-7' : 'brightness-3'}
          onPress={() => setNightmode(!nightMode)}
        /> */}
          <Appbar.Action
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
            <View>
              {state ? (
                <ListCards
                  showModal={showModalHandler}
                  onStateChange={state}
                  onDrag={setToggleSearchBarHandler}
                />
              ) : null}
            </View>
          </Animated.View>
        </SafeAreaView>
        <Modal animationType="fade" transparent={true} visible={modalVisible}>
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

  centeredView: {
    flex: 1,
    flexShrink: 1,
    justifyContent: 'center',
    // alignItems: 'center',
    // marginTop: 22,
    // backgroundColor: 'purple',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default List;
