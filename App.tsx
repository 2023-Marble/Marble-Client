import React, {useState, useEffect} from 'react';
import {NativeModules} from 'react-native';
import {QueryClient, QueryClientProvider} from 'react-query';
import {NavigationContainer} from '@react-navigation/native';
import Login from './screens/Login';
import SplashScreen from 'react-native-splash-screen';
//component
import Stack from './navigation/Stack';

if (__DEV__) {
  import('./reactotronConfig').then(() => console.log('Reactotron Configured'));
}

export default function App() {
  const {CameraModule} = NativeModules;
  useEffect(() => {
    SplashScreen.hide();
    CameraModule.handlePermissions();

  }, []);
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {!isLogin ? (
        <Login />
      ) : (
        <NavigationContainer>
          <Stack />
        </NavigationContainer>
      )}
    </QueryClientProvider>
  );
}
