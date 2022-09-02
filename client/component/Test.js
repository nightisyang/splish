import React from 'react';
import {Text, View} from 'react-native';
import Card from './Card';

const Test = () => {
  function cardClickHandler(uri) {
    console.log('press');
  }

  const RenderCard = async () => {};

  return (
    <View style={{flex: 1, backgroundColor: 'pink'}}>
      <Text>Hello</Text>
      <Card
        onCardClick={cardClickHandler}
        id={'62e257d0a55e10ce13603aa6'}
        name={'Usun Apau'}
        imgArr={[
          {
            uri: 'http://192.168.101.24:3000/images/kotak_telangusan.JPG',
          },
          {
            uri: 'http://192.168.101.24:3000/images/selio_telangusan-1.jpg',
          },
          {uri: 'http://192.168.101.24:3000/images/usun_apau.JPG'},
          {uri: 'http://192.168.101.24:3000/images/western_julan.jpg'},
          {uri: 'http://192.168.101.24:3000/images/eastern_julan.jpg'},
          {
            uri: 'http://192.168.101.24:3000/images/Julan_eastern_danny.jpg',
          },
          {
            uri: 'http://192.168.101.24:3000/images/Julan_eastern_ash.jpg',
          },
          {
            uri: 'http://192.168.101.24:3000/images/julan_jee_mui_lan.jpg',
          },
          {uri: 'http://192.168.101.24:3000/images/selio_GE.JPG'},
          {
            uri: 'http://192.168.101.24:3000/images/lower_selio_telangusan.JPG',
          },
          {uri: 'http://192.168.101.24:3000/images/Julan_GE.JPG'},
          {
            uri: 'http://192.168.101.24:3000/images/eastern_julan_upper.jpg',
          },
          {uri: 'http://192.168.101.24:3000/images/julan_Topo.JPG'},
          {
            uri: 'http://192.168.101.24:3000/images/julan_hazebroek.JPG',
          },
          {uri: 'http://192.168.101.24:3000/images/IMG_9408_Chua.JPG'},
        ]}
        desc={
          'Remote waterfalls with difficult access. The Julan fall is the tallest fall of Sarawak'
        }
      />
    </View>
  );
};

export default Test;
