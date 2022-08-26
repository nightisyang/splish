import React, {useState, useEffect} from 'react';
import {Modal} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import {transparent} from 'react-native-paper/lib/typescript/styles/colors';

const ModalZoom = ({imgUrl, setModalVisibility, startWith}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const swipeDownHandler = () => {
    setModalVisibility();
  };

  let images = [];

  imgUrl.forEach((val, i, arr) => {
    const {uri} = val;
    images.push({url: uri});
  });

  //   console.log(images);

  return (
    <ImageViewer
      imageUrls={images}
      enableSwipeDown={true}
      onCancel={swipeDownHandler}
      index={startWith}
      useNativeDriver={true}
      enablePreload={true}
      doubleClickInterval={500}
      flipThreshold={60}
      swipeDownThreshold={8}
    />
  );
};

export default ModalZoom;
