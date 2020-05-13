import React, { Component } from 'react';
import {
    Button,
    Text,
    TextInput
} from 'react-native';

import { getStorageValue, setStorageValue, clearStorageValue } from '../utils/storage';
import { subscribeToTest } from '../api';
import { HuntList } from './HuntList';
import { EditHunt } from './EditHunt';

  
export class SetupScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
          isLoading: true,
          isAdmin: false,
          token: '',
          SignInError: '',
          SignInPassword: '',
          selectedHunt: null,
          hunts: [{id: '1', title: 'my title'}]
        };

        subscribeToTest((err, data) => this.setState({ 
            SignInError: data 
        }));
    }

    componentDidMount() {
        this.setState({
          isLoading: false
        });

        clearStorageValue('token');

        getStorageValue('token')
        .then(token => {
            if (token) {
                console.log('token: ' + JSON.stringify(token));
                this.setState({
                    token: token
                });
            }
        });

        getStorageValue('isAdmin')
        .then(isAdmin => {
            if (isAdmin) {
                console.log('isAdmin: ' + JSON.stringify(isAdmin));
                this.setState({
                    isAdmin: isAdmin
                });
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
                setStorageValue('token', json.token);
                setStorageValue('isAdmin', json.isAdmin);

                this.setState({
                    SignInError: json.message,
                    isLoading: false,
                    SignInPassword: '',
                    token: json.token,
                    isAdmin: json.isAdmin
                });
            } else {
                this.setState({
                    SignInError: json.message,
                    isLoading: false,
                    token: null,
                    isAdmin: false
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
        token,
        isAdmin,
        SignInError,
        SignInPassword,
        selectedHunt,
        hunts
      } = this.state;

      // Loading Screen 
      if (isLoading) {
        return (<><Text>Loading...</Text></>);
      }

      // Login Screen
      if (!token || !isAdmin) {
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

      if (selectedHunt == null) {
          return (
              <HuntList newHunt={this.newHunt} selectHunt={this.selectHunt} hunts={hunts}/>
          )
      }

      return (
        <EditHunt hunt={selectedHunt} />
      )
    }
};