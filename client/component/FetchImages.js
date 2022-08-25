import React, {useRef, useEffect, useState} from 'react';
import {
  TouchableOpacity,
  View,
  Image,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import ZoomableImage from './ZoomableImage';

const FetchImages = ({
  reqSource,
  item,
  onPress,
  containerHeight,
  windowWidth,
}) => {
  const refWidth = useRef(null);
  const refHeight = useRef(null);
  const [isWidthReady, setWidthReady] = useState(false);
  const [isModal, setIsModal] = useState(false);

  useEffect(() => {
    if (refWidth) {
      console.log('refWidth:', refWidth.current);
      console.log(reqSource);
    }

    if (reqSource === 'modal') {
      setIsModal(true);
    }

    const getImageSize = async () => {
      const {imgWidth, imgHeight} = await new Promise(resolve => {
        Image.getSize(item.uri, (_width, height) => {
          resolve({imgWidth: _width, imgHeight: height});
        });
      });

      console.log(imgWidth, imgHeight);

      if (reqSource === 'modal') {
        refWidth.current = windowWidth;
        refHeight.current = Math.floor((imgHeight / imgWidth) * windowWidth);
      } else {
        refWidth.current = Math.floor((imgWidth / imgHeight) * containerHeight);
        refHeight.current = containerHeight;
        console.log(refWidth.current);
      }

      console.log('refWidth', refWidth.current);
      console.log('refHeight', refHeight.current);

      setWidthReady(true);
    };

    if (!refWidth.current) {
      getImageSize();
    }
  }, [item]);

  return (
    <TouchableHighlight
      onPress={onPress}
      style={[{height: refHeight.current}, styles.itemContainer]}>
      <View style={{flex: 1}}>
        {isWidthReady && (
          <View style={[styles.imgContainer]}>
            {isModal ? (
              <ZoomableImage
                style={{backgroundColor: 'purple'}}
                source={{uri: item.uri.toString()}}
                imageWidth={refWidth.current}
                imageHeight={refHeight.current}
              />
            ) : (
              <FastImage
                source={{
                  uri: item.uri.toString(),
                  priority: FastImage.priority.normal,
                  // cache: FastImage.cacheControl.web,
                }}
                style={{
                  width: refWidth.current,
                  height: refHeight.current,
                  alignSelf: 'center',
                }}
                resizeMode={FastImage.resizeMode.contain}
              />
            )}
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
    // borderWidth: 1,
    // borderColor: 'black',
    // borderRadius: 3,
    // width: '100%',
    // padding: 20,
    // margin: 8,
    // width: 200,
  },

  itemContainer: {
    // flex: 1,
    justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: 'black',
    // padding: 20,
    // marginRight: 5,
    // width: 250,
    // width: '100%',
  },
});
export default FetchImages;
