import React, { Component } from 'react';
import {
    Button,
    Text,
    TextInput
} from 'react-native';

import { getStorageValue, setStorageValue, clearStorageValue } from '../utils/storage';
import { subscribeToTest } from '../api';

import { createStackNavigator } from '@react-navigation/stack';
import { SetupStartScreen } from './SetupStartScreen';
import { SetupMetadataScreen } from './SetupMetadataScreen';
import { GlobalContext } from '../context';

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

    componentDidMount() {
        console.log('SetupScreen mounted')

        this.setState({
          isLoading: false
        });

        // https://reactnavigation.org/docs/function-after-focusing-screen/#triggering-an-action-with-a-focus-event-listener
        const unsubscribe = this.props.navigation.addListener('focus', () => {
          console.log('DefaultScreen focused')
        });

        this.props.navigation.setOptions({
            headerRight: () => (
                <Button
                onPress={() => this.props.navigation.navigate('Hunt')}
                title="Hunt"
                color="#0068ad"
              />
            )
        });

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
    };

    SignIn() {
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
                this.context.token = json.token;
                this.context.isAdmin = json.isAdmin;

                this.setState({
                    SignInError: json.message,
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

        console.log('context: ' + JSON.stringify(context));

        // Loading Screen 
        if (isLoading) {
            return (<><Text>Loading...</Text></>);
        }

        // Login Screen
        if (!this.context.token || !this.context.isAdmin) {
            return (
            <>
                {
                (SignInError) ? (
                    <Text>{SignInError}</Text>
                ) : (null)
                }
                <Text>Admin Password:</Text>
                <TextInput
                    style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                    onChangeText={(text) => { this.setState({ SignInPassword: text})}}
                    value={SignInPassword}
                />
                <Button
                    title="Sign In"
                    onPress={() => this.SignIn()}
                />
            </>
            );
        }

        return (
            <Stack.Navigator>
                <Stack.Screen name="Start" component={SetupStartScreen} />
                <Stack.Screen name="MetaData" component={SetupMetadataScreen} />
            </Stack.Navigator>
        )
    }
};

SetupScreen.contextType = GlobalContext;