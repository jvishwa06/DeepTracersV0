import React, {useEffect} from 'react';
import {AppDataProvider} from './src/providers/AppProvider';
import AppNavigator from './src/navigators/AppNavigator';

function App() {

  return (
    <AppDataProvider>
      <AppNavigator />
    </AppDataProvider>
  );
}

export default App;
