/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

//import mongoose from 'mongoose';
import { DefaultScreen } from './components/UserScreen';
import { SetupScreen } from './components/SetupScreen';

const Drawer = createDrawerNavigator();

class Screen extends Component {
  render() {
    return (
      <NavigationContainer>
        <Drawer.Navigator initialRouteName="Home">
          <Drawer.Screen name="Home" component={DefaultScreen} />
          <Drawer.Screen name="Setup" component={SetupScreen} />
        </Drawer.Navigator>
      </NavigationContainer>
    );
  };
}

export default Screen;