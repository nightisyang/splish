import React, {useState} from 'react';
import {BottomNavigation, Text} from 'react-native-paper';
import List from './List';
import Maps from './Maps';
import Info from './Info';

const WaterfallRoute = () => {
  return <List />;
};

const MapRoute = () => <Maps />;
const InfoRoute = () => <Info />;

const BottomTab = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'maps', title: 'Maps', icon: 'map'},
    {
      key: 'waterfall',
      title: 'Waterfalls',
      icon: 'waves',
      unfocusedIcon: 'heart-outline',
    },
    {key: 'info', title: 'Info', icon: 'information-outline'},
    // {key: 'maps2', title: 'Better Maps', icon: 'map'},

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
    info: InfoRoute,
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
