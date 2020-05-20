import React, { Component } from 'react';
import {
    Button,
    Text,
    TouchableOpacity,
    StyleSheet,
    View
} from 'react-native';

import { createStackNavigator } from '@react-navigation/stack';
import { SetupStartScreen } from './SetupStartScreen';
import { EditHuntScreen } from './EditHuntScreen';
import { HuntSettingsScreen } from './HuntSettingsScreen';
import { GlobalContext } from '../context';
import CustomTextInput from '../components/TextInput';
import { adminsignin, adminsignout } from '../api';
import { getStorageValue, setStorageValue, clearStorageValue } from '../utils/storage';
import { normalize } from '../utils';

const Stack = createStackNavigator();

  
export class SetupScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
          isLoading: true,
          SignInError: '',
          SignInPassword: '',
          selectedHunt: null
        };
    }

    clearUserData = () => {
      this.context.setPlayer(null);
      this.context.setAdmin(false);

      clearStorageValue('player');

      console.log('cleared user data');
    }

    setUserData = (player, isAdmin) => {
      this.context.setPlayer(player);
      this.context.setAdmin(isAdmin);

      setStorageValue('player', player);
      setStorageValue('isAdmin', isAdmin);

      console.log('set player: ' + JSON.stringify(player));
    }

    restoreUserData = async () => {
      let player = await getStorageValue('player');
      let isAdmin = await getStorageValue('isAdmin');

      this.context.setPlayer(player);
      this.context.setAdmin(isAdmin);

      console.log('restored player: ' + JSON.stringify(player));
    }

    signOut = () => {
        adminsignout(this.context.player.id).then(resp => {
          if (resp.success) {
            console.log('signout success');
            this.clearUserData();
          }
        })
    }

    signIn = () => {
        console.log('signIn');

        const {
            SignInPassword,
        } = this.state;

        this.setState({
          isLoading: true,
        });

        adminsignin(SignInPassword)
            .then(resp => {
                console.log('adminsignin resp:', JSON.stringify(resp));
                if (resp.success) {
                    this.setUserData({id: resp.token}, resp.isAdmin);

                    this.setState({
                        SignInError: '',
                        isLoading: false,
                        SignInPassword: ''
                    });
                } else {
                    this.setState({
                        SignInError: resp.message,
                        isLoading: false
                    });
                }
            })
            .catch(err => {
                console.log('adminsignin error: ' + JSON.stringify(err))
                this.setState({
                  isLoading: false,
                  SignInError: 'Failed to connect to server'
                });
            });
    }
  
    newHunt = () => {
        alert('New Hunt!');
    };

    selectHunt = (id) => {
        this.setState({ selectedHunt: id });
    };

    componentDidMount() {
        console.log('SetupScreen mounted')

        this.setState({
          isLoading: false
        });

        this.restoreUserData();
    };

    render() {
        const {
            isLoading,
            SignInError,
            SignInPassword
          } = this.state;

        let context = this.context;

        if (this.context.player && this.context.player.id) {
            this.props.navigation.setOptions({
                headerRight: () => (
                    <Button
                        onPress={() => this.signOut()}
                        title="Logout"
                        color="#0068ad"
                    />
                )
            });
        } else {
            this.props.navigation.setOptions({
                headerRight: () => (null)
            });
        }

        // Loading Screen 
        if (isLoading) {
            return (<><Text>Loading...</Text></>);
        }

        // Login Screen
        if (!this.context.player || !this.context.player.id || !this.context.isAdmin) {
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
                    <Text style={styles.message}>Enter the Admin Password</Text>
                    <CustomTextInput
                        onChangeText={(text) => { this.setState({ SignInPassword: text})}}
                        value={SignInPassword}
                        secureTextEntry={true}
                        placeholder="Password"
                        textAlign={'center'}
                    />
                </View>
                <View style={{flex:1, alignItems: 'center', justifyContent: 'center' }}>
                    {(SignInPassword) ? (
                        <TouchableOpacity onPress={() => this.signIn()} style={styles.button}>
                        <Text style={{ fontSize: normalize(40) }}> SIGN IN </Text>
                        </TouchableOpacity>
                    ) : (null)}
                </View>
                <View style={{flex: 1}}></View>
            </View>
            );
        }

        return (
            <Stack.Navigator initialRouteName={"Start"}>
                <Stack.Screen name="Start" component={SetupStartScreen} />
                <Stack.Screen name="Hunt Settings" component={HuntSettingsScreen} />
                <Stack.Screen name="Edit Hunt" component={EditHuntScreen} />
            </Stack.Navigator>
        )
    }
};

SetupScreen.contextType = GlobalContext;

const styles = StyleSheet.create({
  error: {
    flex: 0,
    alignItems: 'center',
    alignContent: 'center',
    marginTop: normalize(10)
  },
  errorText: {
    color: '#f7530c',
    fontWeight: 'bold',
    fontSize: normalize(30)
  },
  message: {
    paddingLeft: 6,
    fontSize: normalize(60),
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