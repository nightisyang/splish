import {useLinkProps} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';

const Images = ({item, onPress}) => {
  const refWidth = useRef(null);

  useEffect(() => {
    const getImageSize = async () => {
      const {imgWidth, imgHeight} = await new Promise(resolve => {
        Image.getSize(item.uri, (_width, height) => {
          resolve({imgWidth: _width, imgHeight: height});
        });
      });

      refWidth.current = Math.floor((imgWidth / imgHeight) * 150);
    };
    if (!refWidth.current) {
      getImageSize();
    }
  }, []);

  return (
    <TouchableOpacity onPress={onPress} style={styles.itemContainer}>
      <View style={styles.imgContainer}>
        <FastImage
          source={{
            uri: item.uri.toString(),
            priority: FastImage.priority.normal,
          }}
          style={{width: refWidth.current, height: 150}}
          resizeMode={FastImage.resizeMode.contain}
        />
      </View>
    </TouchableOpacity>
  );
};

const Card = ({id, name, imgArr, desc, onCardClick}) => {
  const [selectedId, setSelectedId] = useState(null);

  const navigation = useNavigation();

  const renderImages = ({item, index}) => {
    return <Images item={item} onPress={() => setSelectedId(index)} />;
  };

  const onCardClickHandler = id => {
    // console.log('click on item', item);
    console.log('id of waterfall:', id);
    onCardClick(id);
    navigation.navigate('Info');
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
            keyExtractor={(item, index) => index.toString()}
            extraData={selectedId}
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
