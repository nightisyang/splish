import React, {useEffect, useRef, useState} from 'react';
import {View, Text, FlatList, StyleSheet, Platform} from 'react-native';
import {useNavigation} from '@react-navigation/native';

// import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';

import Card from './Card';

let localhost = '192.168.101.24:3000';

// if (Platform.OS === 'ios') {
//   localhost = '127.0.0.1:3000';
// } else {
//   localhost = '192.168.101.24:3000';
// }

const ListCards = props => {
  const navigation = useNavigation();

  const [waterfalls, setWaterfalls] = useState([
    {id: '', name: '', summary: '', imgFilename: [{uri: ''}]},
  ]);
  const [fetchState, setFetchState] = useState('');
  const scrollPositionRef = useRef(0);
  // const [, setScrollPosition] = useState(0);
  const flatListRef = useRef();

  console.log('ListCard re-render');

  function onDragHandler(text) {
    props.onDrag(text);
  }

  function cardClickHandler(uri) {
    props.showModal(uri);
  }

  const scrollHandler = function (event) {
    if (event.nativeEvent.contentOffset.y !== 0) {
      console.log('scrollHandler:', event.nativeEvent.contentOffset.y);
      scrollPositionRef.current = event.nativeEvent.contentOffset.y;
    }
    // return event.nativeEvent.contentOffset.y;
    // console.log('scroll log:', event.nativeEvent.contentOffset.y);
  };

  useEffect(() => {
    console.log(
      'triggering screen change function',
      props.onReceivingScreenChange,
    );
    if (props.onReceivingScreenChange === 'leaving') {
      console.log('receiving leaving props');
    }
    if (props.onReceivingScreenChange === 'returning') {
      console.log('scrollPosition:', scrollPositionRef.current);
      flatListRef.current.scrollToOffset({
        offset: scrollPositionRef.current,
        animated: false,
      });
    }
  }, [props.onReceivingScreenChange]);

  useEffect(() => {
    // changes state when new prop is passed down
    setFetchState(props.onStateChange);
    scrollPositionRef.current = 0;
    flatListRef.current.scrollToOffset({
      offset: 0,
      animated: true,
    });
  }, [props.onStateChange]);

  const uid = function () {
    return uuidv4();
  };

  async function getWaterfalls() {
    try {
      // fetching json from API
      let response;

      response = await fetch(
        `http://${localhost}/api/v1/waterfalls/?state=${fetchState}`,
        {
          method: 'GET',
        },
      );

      // resolving json
      const json = await response.json();

      // getting necessary info
      const extractInfo = json.data.waterfalls.map((val, i, arr) => {
        const info = {};

        info.id = val._id;
        info.name = val.name;
        info.summary = val.summary;

        info.imgFilenameArr = val.imgDetails.imgFullResFilename.map(
          imgFilename => {
            const obj = {};
            obj.uri = `http://${localhost}/images/${imgFilename}`;

            return obj;
          },
        );

        return info;
      });

      // place extractedInfo in state
      setWaterfalls(extractInfo);
    } catch (err) {
      console.log(err);
    }
  }

  // render each card in flatlist
  const renderItem = ({item}) => {
    return (
      <Card
        onCardClick={cardClickHandler}
        id={item.id}
        name={item.name}
        imgArr={item.imgFilenameArr}
        desc={item.summary}
      />
    );
  };

  useEffect(() => {
    // runs function when new state has changed
    getWaterfalls();
    console.log('filtered state:', fetchState);
    // scrollPositionRef.current = 0;
  }, [fetchState]);

  return (
    <View style={Platform.OS === 'android' ? {marginBottom: 60} : null}>
      <FlatList
        ref={flatListRef}
        contentInset={{top: 0, bottom: 30, left: 0, right: 0}}
        // contentInsetAdjustmentBehavior="automatic"
        // maxToRenderPerBatch={20}
        // pagingEnabled={true}
        centerContent={true}
        data={waterfalls}
        renderItem={renderItem}
        listKey={uid}
        keyExtractor={(item, index) => item.id}
        onScrollBeginDrag={() => {
          // console.log('drag');
          onDragHandler('false');
        }}
        onScrollToTop={() => {
          // console.log('scroll to top');
          onDragHandler('true');
        }}
        onScroll={scrollHandler}
        initialScrollIndex={0}
      />
    </View>
  );
};

export default ListCards;
