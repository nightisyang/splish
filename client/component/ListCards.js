import React, {useEffect, useRef, useState} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';

import Card from './Card';

const ListCards = props => {
  const [waterfalls, setWaterfalls] = useState([
    {name: '', summary: '', imgFilename: [{uri: ''}]},
  ]);
  const [fetchState, setFetchState] = useState('');
  // const fetchState = useRef('');

  function onDragHandler(text) {
    props.onDrag(text);
  }

  useEffect(() => {
    // changes state when new prop is passed down
    setFetchState(props.onStateChange);
  }, [props.onStateChange]);

  async function getWaterfall() {
    try {
      // fetching json from API
      const response = await fetch(
        `http://127.0.0.1:3000/api/v1/waterfalls/?state=${fetchState}`,
        {
          method: 'GET',
        },
      );

      // resolving json
      const json = await response.json();

      // getting necessary info
      const extractInfo = json.data.waterfalls.map((val, i, arr) => {
        const info = {};

        info.name = val.name;
        info.summary = val.summary;

        info.imgFilenameArr = val.imgDetails.imgFullResFilename.map(
          imgFilename => {
            const obj = {};
            obj.uri = `http://127.0.0.1:3000/images/${imgFilename}`;
            // obj.height = 140;

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

  console.log(`No of waterfalls in ${fetchState}`, waterfalls.length);

  // render each card in flatlist
  const renderItem = ({item}) => {
    return (
      <Card name={item.name} imgArr={item.imgFilenameArr} desc={item.summary} />
    );
  };

  useEffect(() => {
    // runs function when new state has changed
    getWaterfall();
    console.log('filtered state:', fetchState);
  }, [fetchState]);

  return (
    <View>
      <FlatList
        contentInset={{top: 0, bottom: 100, left: 0, right: 0}}
        contentInsetAdjustmentBehavior="automatic"
        // maxToRenderPerBatch={20}
        // pagingEnabled={true}
        centerContent={true}
        data={waterfalls}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        onScrollBeginDrag={() => {
          // console.log('drag');
          onDragHandler('false');
        }}
        onScrollToTop={() => {
          console.log('scroll to top');
          onDragHandler('true');
        }}
      />
    </View>
  );
};

export default ListCards;
