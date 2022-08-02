import React, {useEffect, useRef, useState} from 'react';
import {SafeAreaView} from 'react-native';
import {BottomNavigation, Text} from 'react-native-paper';
import List from './List';
import Maps from './Maps';

const WaterfallRoute = () => {
  return <List />;
};

const MapRoute = () => <Maps />;

const RecentsRoute = () => <Text>Recents</Text>;

const BottomTab = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {
      key: 'waterfall',
      title: 'Waterfalls',
      icon: 'water',
      unfocusedIcon: 'heart-outline',
    },
    {key: 'maps', title: 'Maps', icon: 'map'},
    {key: 'recents', title: 'Recents', icon: 'history'},
    // {
    //   key: 'notifications',
    //   title: 'Notifications',
    //   focusedIcon: 'bell',
    //   unfocusedIcon: 'bell-outline',
    // },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    waterfall: WaterfallRoute,
    maps: MapRoute,
    recents: RecentsRoute,
  });

  return (
    <BottomNavigation
      navigationState={{index, routes}}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
};

export default BottomTab;
