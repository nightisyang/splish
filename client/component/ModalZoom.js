import React from 'react';
import ImageViewer from 'react-native-image-zoom-viewer';

const ModalZoom = ({imgUrl, setModalVisibility, startWith}) => {
  const swipeDownHandler = () => {
    setModalVisibility();
  };

  let images = [];

  imgUrl.forEach((val, i, arr) => {
    const {uri} = val;
    images.push({url: uri});
  });

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
