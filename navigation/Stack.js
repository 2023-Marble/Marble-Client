import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from '../screens/Home';

const NativeStack = createNativeStackNavigator();

const Stack = () => {
  return (
    <NativeStack.Navigator
      screenOptions={{
        headerBackTitleVisible: false,
        headerStyle: {
          backgroundColor: 'white',
        },
      }}>
      <NativeStack.Screen name="Home" component={Home} />
    </NativeStack.Navigator>
  );
};
export default Stack;
