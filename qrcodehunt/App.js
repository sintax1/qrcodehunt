import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { AppState } from "react-native";
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

    this.setPlayer = (player) => {
      this.setState({player: player});
    };

    this.setWebsocket = (ws) => {
      this.setState({ws: ws});
    };

    // State also contains the updater function so it will
    // be passed down into the context provider
    this.state = {
      token: defaultContext.token,
      isAdmin: defaultContext.isAdmin,
      hunts: defaultContext.hunts,
      setToken: this.setToken,
      setAdmin: this.setAdmin,
      setPlayer: this.setPlayer,
      setWebsocket: this.setWebsocket,
      //appState: AppState.currentState
    };
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    console.log('nextAppState: ' + JSON.stringify(nextAppState));

    /*
    if (nextAppState.match(/inactive|background/)  && this.state.token) {
      console.log('App going to background. Signing out.')
      signout(this.state.token);
    }
    */

    /*
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
    }
    this.setState({appState: nextAppState});
    */
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