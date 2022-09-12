import React, {useRef, useEffect, useState} from 'react';
import {View, Image, StyleSheet, TouchableHighlight} from 'react-native';
import FastImage from 'react-native-fast-image';

const FetchImages = ({item, onPress, containerHeight}) => {
  const refWidth = useRef(null);
  const refHeight = useRef(null);
  const [isWidthReady, setWidthReady] = useState(false);

  useEffect(() => {
    // fetches size of image and resizes image according to containerHeight
    const getImageSize = async () => {
      const {imgWidth, imgHeight} = await new Promise(resolve => {
        Image.getSize(item.uri, (_width, height) => {
          resolve({imgWidth: _width, imgHeight: height});
        });
      });

      // resizes width of image in ratio
      refWidth.current = Math.floor((imgWidth / imgHeight) * containerHeight);
      refHeight.current = containerHeight;

      setWidthReady(true);
    };
    // calls function whenever a new item/uri is recieved
    getImageSize();
  }, [item]);

  return (
    <TouchableHighlight
      onPress={onPress}
      style={[{height: refHeight.current}, styles.itemContainer]}>
      <View style={styles.flex}>
        {isWidthReady && (
          <View style={[styles.imgContainer]}>
            <FastImage
              source={{
                uri: item.uri.toString(),
                priority: FastImage.priority.normal,
                cache: FastImage.cacheControl.web,
              }}
              style={{
                width: refWidth.current,
                height: refHeight.current,
              }}
              resizeMode={FastImage.resizeMode.contain}
              // onLoad={e =>
              //   // useful to set width and height of images, instead of calling getSize which will result in two calls.
              //   // comment out for now to re-implement later
              //   console.log(e.nativeEvent.width, e.nativeEvent.height)
              // }
            />
          </View>
        )}
      </View>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  imgContainer: {
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex: {flex: 1},

  itemContainer: {
    justifyContent: 'center',
    // backgroundColor: 'black',
  },
});
export default FetchImages;
