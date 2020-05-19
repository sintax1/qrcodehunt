import React, { Component } from 'react';
import {
    Text,
    View,
    Button,
    TouchableOpacity,
    StyleSheet
} from 'react-native';

import { getStorageValue, setStorageValue, clearStorageValue } from '../utils/storage';
import { GlobalContext } from '../context';
import CustomTextInput from '../components/TextInput';
import { createStackNavigator } from '@react-navigation/stack';
import { SelectHuntScreen } from './SelectHuntScreen';
import { PlayHuntScreen } from './PlayHuntScreen';
import { WaitHuntScreen } from './WaitHuntScreen';
import { signin, signout } from '../api';

const Stack = createStackNavigator();

class DefaultScreen extends Component {
    constructor(props) {
      super(props);

      this.state = {
        isLoading: true,
        SignInError: '',
        SignInUsername: '',
        isFocused: false
      };
    }

    clearUserData = () => {
      this.context.setPlayer(null);

      clearStorageValue('player');

      console.log('cleared user data');
    }

    setUserData = (player) => {
      this.context.setPlayer(player);

      setStorageValue('player', player);

      console.log('set player: ' + JSON.stringify(player));
    }

    restoreUserData = async () => {
      let player = await getStorageValue('player');

      this.context.setPlayer(player);

      console.log('restored player: ' + JSON.stringify(player));
    }

    signOut = () => {
      console.log('signOut: ' + JSON.stringify(this.context.player.id));
      signout(this.context.player.id).then(resp => {
        if (resp.success) {
          console.log('signout success');
          this.clearUserData();
        }
      })
    }

    SignIn = () => {
        const {
            SignInUsername,
        } = this.state;

        this.setState({
          isLoading: true
        });

        signin(SignInUsername)
        .then(resp => {
          console.log('signin resp: ', JSON.stringify(resp));
          if (resp.success) {
              this.setUserData({
                id: resp.token,
                name: SignInUsername
              });
              this.setState({
                SignInError: '',
                isLoading: false
            });
          } else {
              this.setState({
                  SignInError: resp.message,
                  isLoading: false,
              });
          }
        })
        .catch(err => {
          console.log('signin error: ' + JSON.stringify(err))
          this.setState({
            isLoading: false,
            SignInError: 'Failed to connect to server'
          });
        })
    }

    componentDidMount = () => {
      console.log('DefaultScreen context: ' + JSON.stringify(this.context))

      this.setState({
        isLoading: false
      });

      this.restoreUserData();

      this.props.navigation.setOptions({
          headerRight: () => (
            <View style={{flexDirection: 'row'}}>
              {(this.context.player && this.context.player.id) ? (
                <View style={{paddingRight: 5}}>
                <Button
                  onPress={() => this.signOut()}
                  title="Logout"
                  color="#0068ad"
                />
                </View>
              ) : (null)}
              <View style={{paddingRight: 5}}>
                <Button
                  onPress={() => this.props.navigation.navigate('Setup')}
                  title="Setup"
                  color="#0068ad"
                />
              </View>
            </View>
          )
      });
    }

    render() {
      const {
        isLoading,
        SignInError,
        SignInUsername,
      } = this.state;

      // Loading Screen 
      if (isLoading) {
        return (<><Text>Loading...</Text></>);
      }

      // Login Screen
      if (!this.context.player || !this.context.player.id) {
        return (
          <View style={{flex:1, backgroundColor:'#347deb'}}>
            {
            (SignInError) ? (
              <View style={styles.error}>
                <Text style={styles.errorText}>{SignInError}</Text>
              </View>
            ) : (null)
            }
            <View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={styles.message}>Enter a name to get started!</Text>
            </View>
            <View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
              <CustomTextInput
                  placeholder="Your Name"
                  onChangeText={(text) => {this.setState({ SignInUsername: text})}}
                  textAlign={'center'}
              />
            </View>
            <View style={{flex:1, alignItems: 'center', justifyContent: 'center' }}>
              {(SignInUsername) ? (
                <TouchableOpacity onPress={this.SignIn} style={styles.button}>
                  <Text style={{ fontSize: 40 }}> PLAY! </Text>
                </TouchableOpacity>
              ) : (null)}
            </View>
            <View style={{flex: 1}}></View>
         </View>
        );
      }

      return (
        <Stack.Navigator>
            <Stack.Screen name="Select a Hunt" component={SelectHuntScreen} />
            <Stack.Screen name="Wait to Start" component={WaitHuntScreen} />
            <Stack.Screen name="Hunt" component={PlayHuntScreen} />
        </Stack.Navigator>
      )
    }
};
DefaultScreen.contextType = GlobalContext;

export default DefaultScreen;

const styles = StyleSheet.create({
  error: {
    flex: 0,
    alignItems: 'center',
    alignContent: 'center',
    marginTop: 10
  },
  errorText: {
    color: '#f7530c',
    fontWeight: 'bold',
    fontSize: 30
  },
  message: {
    height: 100,
    paddingLeft: 6,
    fontSize: 60,
    textAlign: 'center',
    color: 'white'
  },
  button: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    bottom: 50
  }
});