import React, {useRef, useEffect, useState} from 'react';
import {TouchableOpacity, View, Image, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';

const FetchImages = ({reqSource, item, onPress, containerHeight}) => {
  const refWidth = useRef(null);
  const [isWidthReady, setWidthReady] = useState(false);

  useEffect(() => {
    if (refWidth) {
      console.log('refWidth:', refWidth.current);
      console.log(reqSource);
    }

    const getImageSize = async () => {
      const {imgWidth, imgHeight} = await new Promise(resolve => {
        Image.getSize(item.uri, (_width, height) => {
          resolve({imgWidth: _width, imgHeight: height});
        });
      });

      console.log(imgWidth, imgHeight);
      console.log('containerHeight:', containerHeight);

      refWidth.current = Math.floor((imgWidth / imgHeight) * containerHeight);
      console.log(refWidth.current);
      setWidthReady(true);
    };

    if (!refWidth.current) {
      getImageSize();
    }
  }, [item]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.itemContainer, {height: containerHeight}]}>
      <View style={{flex: 1}}>
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
                height: containerHeight,
                alignSelf: 'center',
              }}
              resizeMode={FastImage.resizeMode.contain}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  imgContainer: {
    flex: 1,
    overflow: 'hidden',
    // borderWidth: 1,
    // borderColor: 'black',
    // borderRadius: 3,
    // width: '100%',
    // padding: 20,
    // margin: 8,
    // width: 200,
  },

  itemContainer: {
    flex: 1,
    justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: 'black',
    // padding: 20,
    // marginRight: 5,
    // width: 250,
    // width: '100%',
  },
});
export default FetchImages;
