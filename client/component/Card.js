import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const DATA = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'First Photo',
    img: {
      source: require('../assets/img1.jpg'),
      //   width: 64,
      //   height: 64,
    },
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Second Photo',
    img: {
      source: require('../assets/img2.jpg'),
      //   width: 64,
      //   height: 64,
    },
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    title: 'Third Photo',
    img: {
      source: require('../assets/img3.jpg'),
      //   width: 64,
      //   height: 64,
    },
  },
];

const Item = ({item, onPress, backgroundColor, textColor}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.itemContainer, backgroundColor]}>
    <View style={styles.item}>
      {/* <Text style={[styles.title, textColor]}>{item.title}</Text> */}
      <Image source={item.img.source} />
    </View>
  </TouchableOpacity>
);

const Card = ({title, imgArr, desc}) => {
  const [selectedId, setSelectedId] = useState(null);

  const renderItem = ({item}) => {
    const backgroundColor = item.id === selectedId ? '#6e3b6e' : '#f9c2ff';
    const color = item.id === selectedId ? 'white' : 'black';

    return (
      <Item
        item={item}
        onPress={() => setSelectedId(item.id)}
        backgroundColor={{backgroundColor}}
        textColor={{color}}
      />
    );
  };

  return (
    <View style={styles.appContainer}>
      <View style={styles.titleContainer}>
        <Text>{title}</Text>
      </View>

      {/* horizontal scroll box for images */}
      <View style={styles.imageContainer}>
        <FlatList
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          data={DATA}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          extraData={selectedId}>
          {/* <Text>Image Container</Text>
            <Image source={logo} />
            <Image source={logo} />
            <Image source={logo} />
            <Image source={logo} />
            <Image source={logo} />
            <Image source={logo} /> */}
        </FlatList>
      </View>

      <View style={styles.description}>
        <Text>Description {desc}</Text>
      </View>
    </View>
  );
};

export default Card;

const styles = StyleSheet.create({
  appContainer: {
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

  item: {
    // backgroundColor: '#f9c2ff',
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
    width: 250,
  },

  imageContainer: {
    // height: 150,
    // width: '100%',
    backgroundColor: 'yellow',
    // margin: 10,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    height: 150,
  },

  description: {
    backgroundColor: 'purple',
    height: 100,
    width: '100%',
  },

  text: {},
});
