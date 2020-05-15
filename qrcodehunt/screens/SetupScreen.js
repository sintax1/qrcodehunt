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

    logout() {
        this.context.setToken(null);
    }

    componentDidMount() {
        console.log('SetupScreen mounted')

        this.setState({
          isLoading: false
        });

        // https://reactnavigation.org/docs/function-after-focusing-screen/#triggering-an-action-with-a-focus-event-listener
        const unsubscribe = this.props.navigation.addListener('focus', () => {
          console.log('DefaultScreen focused')
        });

        /*
        getStorageValue('token')
        .then(token => {
            if (token) {
                this.context.token
            }
        });

        getStorageValue('isAdmin')
        .then(isAdmin => {
            if (isAdmin) {
                this.context.isAdmin = isAdmin;
            }
        })
        */
    };

    SignIn = () => {
        const {
            SignInPassword,
        } = this.state;

        this.setState({
          isLoading: true,
        });

        // Post request to backend
        fetch('http://192.168.7.253:3000/api/admin/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password: SignInPassword
            }),
        })
        .then(res => res.json())
        .then(json => {
            console.log('json', json);
            if (json.success) {
                this.context.setToken(json.token);
                this.context.setAdmin(json.isAdmin);

                this.setState({
                    SignInError: '',
                    isLoading: false,
                    SignInPassword: ''
                });
            } else {
                this.setState({
                    SignInError: json.message,
                    isLoading: false
                });
            }
        });
    }
  
    newHunt = () => {
        alert('New Hunt!');
    };

    selectHunt = (id) => {
        this.setState({ selectedHunt: id });
    };

    render() {
        const {
            isLoading,
            SignInError,
            SignInPassword
          } = this.state;

        let context = this.context;

        console.log('SetupScreen context: ' + JSON.stringify(context));

        if (this.context.token) {
            this.props.navigation.setOptions({
                headerRight: () => (
                    <Button
                        onPress={() => this.logout()}
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
        if (!this.context.token || !this.context.isAdmin) {
            return (
            <View style={{flex:1, backgroundColor:'#347deb'}}>
                {
                (SignInError) ? (
                    <View style={{flex:1}}>
                        <Text>{SignInError}</Text>
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
                        <TouchableOpacity onPress={this.SignIn} style={styles.button}>
                        <Text style={{ fontSize: 40 }}> SIGN IN </Text>
                        </TouchableOpacity>
                    ) : (null)}
                </View>
            </View>
            );
        }

        return (
            <Stack.Navigator>
                <Stack.Screen name="Start" component={SetupStartScreen} />
                <Stack.Screen name="Hunt Settings" component={HuntSettingsScreen} />
                <Stack.Screen name="Edit Hunt" component={EditHuntScreen} />
            </Stack.Navigator>
        )
    }
};

SetupScreen.contextType = GlobalContext;

const styles = StyleSheet.create({
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