import React, {useEffect, useState, useContext} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from '../screens/Home';
import Mypage from '../screens/Mypage';
import Login from '../screens/Login';
import SplashScreen from 'react-native-splash-screen';
import {NativeModules} from 'react-native';
import {TokenContext} from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NativeStack = createNativeStackNavigator();

const Stack = () => {
  const {token, setToken} = useContext(TokenContext);
  const {CameraModule} = NativeModules;
  const [isLoading, setIsLoading] = useState(false);

  const getToken = async () => {
    const value = await AsyncStorage.getItem('@refreshToken');
    value !== null ? setToken(JSON.parse(value)) : setToken('');
    setIsLoading(true);
  };
  useEffect(() => {
    getToken();
    SplashScreen.hide();
    CameraModule.handlePermissions();
  }, []);

  return (
    isLoading && (
      <NativeStack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={token === '' ? 'Login' : 'Home'}>
        <NativeStack.Screen name="Home" component={Home} />
        <NativeStack.Screen name="Login" component={Login} />
        <NativeStack.Screen name="Mypage" component={Mypage} />
      </NativeStack.Navigator>
    )
  );
};
export default Stack;
