import React, {useState} from 'react';
import {QueryClient, QueryClientProvider} from 'react-query';
import {NavigationContainer} from '@react-navigation/native';
import Login from './screens/Login';
//component
import Stack from './navigation/Stack';

if (__DEV__) {
  import('./reactotronConfig').then(() => console.log('Reactotron Configured'));
}

export default function App() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
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
