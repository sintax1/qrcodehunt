/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import 'react-native-gesture-handler';
import React, { Component } from 'react';
import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import DefaultScreen from './screens/DefaultScreen';
import { SetupScreen } from './screens/SetupScreen';
import { GlobalContext, defaultContext } from './context';

const Stack = createStackNavigator();

class App extends Component {  
  render() {
    return (
      <GlobalContext.Provider value={defaultContext}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#347deb'
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              alignSelf: 'center'
            },
          }}    
        >
          <Stack.Screen
            name="Hunt"
            component={DefaultScreen}
            options={{
              headerTitle: 'QR Hunt',
            }}
          />
          <Stack.Screen
            name="Setup"
            component={SetupScreen}
            options={{ headerTitle: 'Setup' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      </GlobalContext.Provider>
    );
  };
}

export default App;