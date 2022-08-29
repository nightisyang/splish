import React, {useState} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Pressable,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Text} from 'react-native-paper';
// import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';

import FetchImages from './FetchImages';

const Card = ({id, name, imgArr, desc, onCardClick}) => {
  const navigation = useNavigation();

  const onImagePress = uri => {
    const info = [imgArr, uri];

    onCardClick(info);
  };

  const renderImages = ({item, index}) => {
    return (
      <View style={{flex: 1, paddingRight: 5}}>
        <FetchImages
          reqSource={'card'}
          item={item}
          containerHeight={150}
          onPress={() => {
            onImagePress(item);
          }}
        />
      </View>
    );
  };

  const onCardClickHandler = _id => {
    console.log('id of waterfall:', _id);
    // navigation.pop();
    navigation.navigate('Info', {waterfallID: _id});
  };

  const uuid = function () {
    console.log('uuid called:', Date.now());
    return uuidv4();
  };

  return (
    <TouchableOpacity onPress={() => onCardClickHandler(id)}>
      <View style={styles.cardContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{name}</Text>
        </View>

        {/* horizontal scroll box for images */}
        <View style={styles.imageScrollContainer}>
          <FlatList
            horizontal
            pagingEnabled={true}
            showsHorizontalScrollIndicator={false}
            data={imgArr}
            renderItem={renderImages}
            keyExtractor={(item, index) =>
              // console.log(item.uri.split('/').slice(-1)[0]);
              item.uri.split('/').slice(-1)[0]
            }
            listKey={uuid}
          />
        </View>

        <View style={styles.descContainer}>
          {/* <Text style={styles.descTitle}>Description</Text> */}
          <Text style={styles.descText}>{desc}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default Card;

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    // alignItems: 'center',
    backgroundColor: 'white',
    // borderWidth: 1,
    // borderColor: 'black',
    // borderRadius: 10,
    marginTop: 5,
    // padding: 5,
    // height: 350,
  },

  titleContainer: {
    // backgroundColor: 'orange',
    // height: 50,
    margin: 5,
    padding: 5,
  },

  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  imgContainer: {
    overflow: 'hidden',
    // borderWidth: 1,
    // borderColor: 'black',
    borderRadius: 3,
    // padding: 20,
    // margin: 8,
    height: 150,
    // width: 200,
  },

  itemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    // padding: 20,
    marginRight: 5,
    // width: 250,
  },

  imageScrollContainer: {
    // width: '100%',
    // backgroundColor: 'yellow',
    margin: 5,
    // borderWidth: 1,
    // borderColor: 'black',
    // borderRadius: 10,
    // height: 150,
  },

  imgCenter: {
    // resizeMode: 'center',
    // width: 250,
  },

  descTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  descContainer: {
    // backgroundColor: 'purple',
    margin: 5,
    // height: 100,
    padding: 5,
  },

  descText: {fontSize: 15},
});
