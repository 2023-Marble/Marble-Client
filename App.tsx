import React, {useState} from 'react';
import {QueryClient, QueryClientProvider} from 'react-query';
import {NavigationContainer} from '@react-navigation/native';
//component
import Stack from './navigation/Stack';

export default function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack />
      </NavigationContainer>
    </QueryClientProvider>
  );
}
