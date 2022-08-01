// import {
//   Appbar,
//   DarkTheme,
//   DefaultTheme,
//   Provider,
//   Surface,
//   ThemeProvider,
// } from 'react-native-paper';
import React, {useState} from 'react';
import {SafeAreaView, StatusBar, StyleSheet, View} from 'react-native';
import DropDown from 'react-native-paper-dropdown';

function Dropdown(props) {
  const [showDropDown, setShowDropDown] = useState(false);
  const [state, setState] = useState('');

  function onStateChangeHandler(obj) {
    props.onStateChange(obj);
    console.log('child', obj);
  }

  const stateList = [
    {
      label: 'Johor',
      value: 'Johore',
    },
    {
      label: 'Kedah',
      value: 'Kedah',
    },
    {
      label: 'Kelantan',
      value: 'Kelantan',
    },
    {
      label: 'Malacca',
      value: 'Malacca',
    },
    {
      label: 'Negeri Sembilan',
      value: 'Negeri Sembilan',
    },
    {
      label: 'Pahang',
      value: 'Pahang',
    },
    {
      label: 'Perak',
      value: 'Perak',
    },
    {
      label: 'Perlis',
      value: 'Perlis',
    },
    {
      label: 'Sabah',
      value: 'Sabah',
    },
    {
      label: 'Sarawak',
      value: 'Sarawak',
    },
    {
      label: 'Selangor',
      value: 'Selangor',
    },
    {
      label: 'Terrenganu',
      value: 'Terrenganu',
    },
    {
      label: 'Kuala Lumpur',
      value: 'Kuala Lumpur',
    },
  ];

  return (
    <DropDown
      label={'State'}
      mode={'outlined'}
      visible={showDropDown}
      showDropDown={() => setShowDropDown(true)}
      onDismiss={() => setShowDropDown(false)}
      value={state}
      setValue={onStateChangeHandler}
      list={stateList}
    />
  );
}

export default Dropdown;
