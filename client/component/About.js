import React, {useRef, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  Image,
  StyleSheet,
  Linking,
  Pressable,
  Alert,
  Animated,
} from 'react-native';
import {Appbar, Text, Card} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Clipboard from '@react-native-clipboard/clipboard';
import configData from '../config.json';

import StatusBarTheme from './StatusBarTheme';

const FadeInView = props => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View // Special animatable View
      style={{
        ...props.style,
        opacity: fadeAnim, // Bind opacity to animated value
        transform: [
          {
            scale: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.85, 1],
            }),
          },
        ],
      }}>
      {props.children}
    </Animated.View>
  );
};

const About = () => {
  const navigation = useNavigation();

  const onPress = async dest => {
    if (dest === 'wom') {
      const url = 'https://waterfallsofmalaysia.com/d.php';
      await Linking.canOpenURL(url);
      Linking.openURL(url);
    }

    if (dest === 'github') {
      const url = 'https://github.com/nightisyang';
      await Linking.canOpenURL(url);
      Linking.openURL(url);
    }

    if (dest === 'email') {
      Clipboard.setString('example@example.com');

      Alert.alert('Email copied', '', [
        {text: 'OK', onPress: () => console.log('OK Pressed')},
      ]);

      //   const mailto = 'mailto:example@example.com';
      //   await Linking.canOpenURL(mailto);
      //   Linking.openURL(mailto);
    }

    if (dest === 'instagram') {
      const url = 'https://instagram.com';
      await Linking.canOpenURL(url);
      Linking.openURL(url);
    }
  };

  return (
    <StatusBarTheme>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          style={styles.appBarTitle}
          titleStyle={{textAlign: 'center'}}
          title="About"
        />
        {/* <Appbar.Action /> */}
        {/* <Appbar.Action icon="magnify" /> */}
        {/* <Appbar.Action icon="dots-vertical" /> */}
      </Appbar.Header>

      <SafeAreaView style={styles.screenContainer}>
        <FadeInView style={styles.logoContainer}>
          <Image
            source={require('../assets/splish_logo.png')}
            style={styles.imageStyle}
          />
        </FadeInView>
        <Card elevation={20} style={styles.textCardContainer}>
          <View>
            <View style={styles.textContainer} />
            <Text style={styles.textStyle}>
              An outdoor focused app, with small beginnings. A work in progress.{' '}
              {'\n\n'}
              Credits and acknowledgement to the good folks at{' '}
              <Text
                style={styles.textHighlight}
                onPress={() => {
                  onPress('wom');
                }}>
                waterfallsofmalaysia.com
              </Text>
              {''} where contents of the app are heavily appropriated from with
              permission.{'\n\n'}
              Information on the app is made available on a best effort basis
              and should not be construded as sole truth. {'\n\n'}
              Stay safe while making a splash!
            </Text>
          </View>
        </Card>
        <View style={styles.flex}>
          <View style={styles.linkContainer}>
            <Pressable
              style={styles.linkIcon}
              onPress={() => {
                onPress('email');
              }}>
              <MaterialCommunityIcons name="at" size={53} />
            </Pressable>
            <Pressable
              style={styles.linkIcon}
              onPress={() => {
                onPress('github');
              }}>
              <Image
                source={require('../assets/github_logo.png')}
                style={{resizeMode: 'stretch', width: 50, height: 50}}
              />
            </Pressable>
            <Pressable
              style={styles.linkIcon}
              onPress={() => {
                onPress('instagram');
              }}>
              <Image
                source={require('../assets/instagram_logo.png')}
                style={{flex: 1, resizeMode: 'center', width: 50}}
              />
            </Pressable>
          </View>
          <View style={styles.versionText}>
            <Text>Version: {configData.APP_VERSION} </Text>
          </View>
        </View>
      </SafeAreaView>
    </StatusBarTheme>
  );
};

const styles = StyleSheet.create({
  screenContainer: {flex: 1, backgroundColor: '#473FA8'},
  flex: {flex: 1},
  appBarTitle: {
    marginLeft: 0,
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: -1,
  },
  logoContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#473FA8',
  },
  imageStyle: {
    flex: 1,
    resizeMode: 'center',
    width: 250,
    // backgroundColor: 'orange',
  },
  textCardContainer: {
    flex: 3,
    backgroundColor: '#ECF0F1',
    borderRadius: 20,
    padding: 20,
    paddingTop: 30,
    margin: 10,
  },
  textContainer: {
    width: '70%',
    borderWidth: 0.5,
    borderRadius: 20,
    marginHorizontal: 50,
    marginTop: -20,
    marginBottom: 20,
    // borderColor: '#ECF0F2',
  },
  textStyle: {textAlign: 'justify'},
  textHighlight: {color: 'blue', textDecorationLine: 'underline'},
  linkContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 5,
    paddingHorizontal: 70,
  },
  linkIcon: {
    width: 50,
    height: 50,
  },
  versionText: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 5,
  },
});

export default About;
