import React, {useEffect, useState} from 'react';
import {View, Text, FlatList} from 'react-native';
import Card from './Card';

const ListCards = () => {
  const [waterfalls, setWaterfalls] = useState([
    {name: '', summary: '', imgFilename: [{uri: '', height: Number}]},
  ]);

  async function getWaterfall() {
    try {
      // fetching json from API
      const response = await fetch('http://127.0.0.1:3000/api/v1/waterfalls/', {
        method: 'GET',
      });

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
            obj.height = 140;

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
      <Card name={item.name} imgArr={item.imgFilenameArr} desc={item.summary} />
    );
  };

  useEffect(() => {
    getWaterfall();
  }, []);

  return (
    <View>
      <FlatList
        data={waterfalls}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

export default ListCards;
