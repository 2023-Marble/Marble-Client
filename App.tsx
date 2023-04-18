import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

//component
import Home from "./screens/Home"

export default function App(){
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Home/>
    </QueryClientProvider>
  );
}