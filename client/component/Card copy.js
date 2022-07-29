import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const Item = ({item, onPress, backgroundColor, textColor}) => (
  <TouchableOpacity onPress={onPress} style={styles.itemContainer}>
    <View style={styles.imgContainer}>
      {/* <Text style={[styles.title, textColor]}>{item.title}</Text> */}
      <Image source={item.img} style={styles.imgCenter} />
    </View>
  </TouchableOpacity>
);

const Card = ({name, imgArr, desc}) => {
  const [selectedId, setSelectedId] = useState(null);
  const [data, setData] = useState([]);
  const [images, setImages] = useState();

  async function getWaterfall() {
    try {
      // fetching json from API
      const response = await fetch(
        'http://127.0.0.1:3000/api/v1/waterfalls/62e257d0a55e10ce136039ee',
        {
          method: 'GET',
        },
      );

      // resolving json
      const json = await response.json();

      // set data state - necessary for UI update e.g. name, summary, images etc
      setData(json.data.waterfall);

      // new variable for image filename to shorten url
      const imgFullResFilename =
        json.data.waterfall.imgDetails.imgFullResFilename;

      let imageArr = [];
      imgFullResFilename.forEach((el, i, arr) => {
        imageArr.push({
          id: [i],
          img: {
            uri: `http://127.0.0.1:3000/images/${el}`,
            height: 140,
          },
        });
      });

      setImages(imageArr);
    } catch (err) {
      console.log(err);
    }
  }

  const renderItem = ({item}) => {
    return <Item item={item} onPress={() => setSelectedId(item.id)} />;
  };

  useEffect(() => {
    getWaterfall();
  }, []);
  //   console.log('see this', images);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.titleContainer}>
        <Text>{data.name}</Text>
      </View>

      {/* horizontal scroll box for images */}
      <View style={styles.imageScrollContainer}>
        <FlatList
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          data={images}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          extraData={selectedId}
        />
      </View>

      <View style={styles.descContainer}>
        {/* <Text style={styles.descTitle}>Description</Text> */}
        <Text>{data.summary}</Text>
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
    backgroundColor: '#3B6CD4',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    margin: 5,
    padding: 5,
    height: 350,
  },

  titleContainer: {
    backgroundColor: 'orange',
    height: 50,
    // fontSize: 32,
  },

  imgContainer: {
    backgroundColor: 'black',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,

    // padding: 20,
    // margin: 8,
    // height: 150,
    // width: 200,
  },

  itemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#f9c2ff',
    // padding: 20,
    margin: 5,
    // width: 250,
  },

  imageScrollContainer: {
    // width: '100%',
    backgroundColor: 'yellow',
    // margin: 10,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    height: 150,
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
    backgroundColor: 'purple',
    height: 100,
    width: '100%',
  },

  text: {},
});
