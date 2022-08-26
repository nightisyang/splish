import React, {useEffect, useRef, useState} from 'react';
import {View, Text, FlatList, StyleSheet, Platform} from 'react-native';
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
  const [waterfalls, setWaterfalls] = useState([
    {name: '', summary: '', imgFilename: [{uri: ''}]},
  ]);
  const [fetchState, setFetchState] = useState('');

  function onDragHandler(text) {
    props.onDrag(text);
  }

  function cardClickHandler(uri) {
    props.showModal(uri);
  }

  useEffect(() => {
    // changes state when new prop is passed down
    setFetchState(props.onStateChange);
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
  }, [fetchState]);

  return (
    <View>
      <FlatList
        // contentInset={{top: 0, bottom: 0, left: 0, right: 0}}
        contentInsetAdjustmentBehavior="automatic"
        // maxToRenderPerBatch={20}
        // pagingEnabled={true}
        centerContent={true}
        data={waterfalls}
        renderItem={renderItem}
        listKey={uid}
        keyExtractor={(item, index) => {
          item.id;
        }}
        onScrollBeginDrag={() => {
          // console.log('drag');
          onDragHandler('false');
        }}
        onScrollToTop={() => {
          // console.log('scroll to top');
          onDragHandler('true');
        }}
      />
    </View>
  );
};

export default ListCards;
