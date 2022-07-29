import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const Item = ({item, onPress}) => {
  const [width, setWidth] = useState({width: Number});

  Image.getSize(item.uri, (width, height) => {
    const heightRatio = height / 140;
    const widthRatio = Math.floor(width / heightRatio);
    setWidth({width: widthRatio});
  });

  return (
    <TouchableOpacity onPress={onPress} style={styles.itemContainer}>
      <View style={styles.imgContainer}>
        <Image source={item} style={[styles.imgCenter, width]} />
      </View>
    </TouchableOpacity>
  );
};

const Card = ({name, imgArr, desc}) => {
  const [selectedId, setSelectedId] = useState(null);
  //   console.log(imgArr);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{name}</Text>
      </View>

      {/* horizontal scroll box for images */}
      <View style={styles.imageScrollContainer}>
        <FlatList
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          data={imgArr}
          renderItem={({item, index}) => {
            // console.log(item);

            return <Item item={item} onPress={() => setSelectedId(index)} />;
          }}
          //   renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          extraData={selectedId}
        />
      </View>

      <View style={styles.descContainer}>
        {/* <Text style={styles.descTitle}>Description</Text> */}
        <Text style={styles.descText}>{desc}</Text>
      </View>
    </View>
  );
};

// const compiledCards = () => {
//   return <View></View>;
// };

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
    // height: 150,
    // width: 200,
  },

  itemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'black',
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
    resizeMode: 'center',
    width: 250,
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
