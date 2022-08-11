import React, {useState} from 'react';
import DropDown from 'react-native-paper-dropdown';

function Dropdown(props) {
  const [showDropDown, setShowDropDown] = useState(false);
  const [state, setState] = useState('');

  function onStateChangeHandler(obj) {
    // passes obj to parent List
    console.log('child', obj);
    props.onStateChange(obj);
    setState(obj);
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
      label: 'Terengganu',
      value: 'Terengganu',
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
