import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from '../screens/Home';
import Mypage from '../screens/Mypage';

const NativeStack = createNativeStackNavigator();

const Stack = () => {
  return (
    <NativeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <NativeStack.Screen name="Home" component={Home} />
      <NativeStack.Screen name="Mypage" component={Mypage} />
    </NativeStack.Navigator>
  );
};
export default Stack;
