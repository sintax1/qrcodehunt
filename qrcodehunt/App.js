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
  constructor(props) {
    super(props);

    this.setToken = (token) => {
      this.setState({token: token});
    };

    this.setAdmin = (isAdmin) => {
      this.setState({isAdmin: isAdmin});
    };

    // State also contains the updater function so it will
    // be passed down into the context provider
    this.state = {
      token: defaultContext.token,
      isAdmin: defaultContext.isAdmin,
      hunts: defaultContext.hunts,
      setToken: this.setToken,
      setAdmin: this.setAdmin
    };
  }

  render() {
    return (
      <GlobalContext.Provider value={this.state}>
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