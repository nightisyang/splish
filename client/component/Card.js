import React from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Text, Card as RNPaperCard} from 'react-native-paper';
// import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';

import FetchImages from './FetchImages';

const Card = ({id, name, imgArr, desc, onCardClick}) => {
  const navigation = useNavigation();

  // passes imgArr and uri to Parent for Modal view
  const onImagePress = uri => {
    const info = [imgArr, uri];

    onCardClick(info);
  };

  // renders each image in FlatList to be displayed in Card
  const renderImages = ({item, index}) => {
    return (
      <View style={styles.itemContainer}>
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
    // console.log('id of waterfall:', _id);
    navigation.navigate('Info', {waterfallID: _id});
  };

  const uuid = function () {
    // console.log('uuid called:', Date.now());
    return uuidv4();
  };

  return (
    <TouchableOpacity
      style={styles.flex}
      onPress={() => onCardClickHandler(id)}>
      <View style={styles.cardContainer}>
        <RNPaperCard elevation={5}>
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
              keyExtractor={(item, index) => {
                const key = item.uri.split('/').slice(-1)[0];
                return key;
              }}
              listKey={uuid}
            />
          </View>

          <View style={styles.descContainer}>
            <Text style={styles.descText}>{desc}</Text>
          </View>
        </RNPaperCard>
      </View>
    </TouchableOpacity>
  );
};

export default Card;

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    borderRadius: 10,
    marginTop: 12,
    paddingHorizontal: 5,
  },

  flex: {flex: 1},

  titleContainer: {
    margin: 5,
    padding: 5,
  },

  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  itemContainer: {
    flex: 1,
    paddingRight: 5,
  },

  imageScrollContainer: {
    margin: 5,
  },

  descContainer: {
    margin: 5,
    padding: 5,
  },

  descText: {fontSize: 15},
});
