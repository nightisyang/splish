import React, {useEffect, useState} from 'react';

const MapIDState = ({recieveID}) => {
  const [mapID, setMapID] = useState(null);
  const [waterfallID, setWaterfallID] = useState('null');

  useEffect(() => {
    console.log(`Map ID recieved! ${recieveID}`);
  });

  //   const navigateWaterfallDetails = function (id) {
  //     setWaterfallID(id);
  //     console.log('it is alive');
  //     // console.log('passed id to parent:', id);
  //   };

  //   const WaterfallRoute = () => <List passIDToApp={navigateWaterfallDetails} />;
  //   const MapRoute = () => <Maps onReceiveID={navigateWaterfallDetails} />;
  //   const InfoRoute = () => <Info waterfallID={waterfallID} />;
};

export default MapIDState;
