import React, {useState, useEffect, createContext, useMemo} from 'react';
import {QueryClient, QueryClientProvider} from 'react-query';
import {NavigationContainer} from '@react-navigation/native';

//component
import Stack from './navigation/Stack';

if (__DEV__) {
  import('./reactotronConfig').then(() => console.log('Reactotron Configured'));
}

interface TokenContextType {
  token: string;
  setToken: React.Dispatch<React.SetStateAction<string>>;
}

export const TokenContext = createContext<TokenContextType>({
  token: '',
  setToken: () => {},
});

export default function App() {
  const [token, setToken] = useState<string>('');

  
  const value = useMemo(() => ({token, setToken}), [token, setToken]);
  const queryClient = new QueryClient();

  return (
    <TokenContext.Provider value={value}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <Stack />
        </NavigationContainer>
      </QueryClientProvider>
    </TokenContext.Provider>
  );
}
