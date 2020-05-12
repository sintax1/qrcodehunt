import React, { Component } from 'react';
import {
    Text,
    View,
    TextInput,
    Button,
    Alert
  } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { styles } from '../styles';
import { getStorageValue, setStorageValue, clearStorageValue } from '../utils/storage';
import { subscribeToTest } from '../api';


class Login extends Component {
    render() {
      return (
        <>
          <Text>Login</Text>
        </>
      )
    }
}

class Hints extends Component {
    render() {
      return (
        <>
          <Text>Hints</Text>
        </>
      )
    }
}
  
export class DefaultScreen extends Component {
    constructor(props) {
      super(props);

      this.state = {
        isLoading: true,
        token: '',
        SignInError: '',
        SignInUsername: ''
      };

      subscribeToTest((err, data) => this.setState({ 
        SignInError: data 
    }));
    }

    SignIn() {
        const {
            SignInUsername,
        } = this.state;

        this.setState({
          isLoading: true,
        });

        // Post request to backend
        fetch('http://192.168.7.253:3000/api/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: SignInUsername
            }),
        }).then(res => res.json())
            .then(json => {
                console.log('json', json);
                if (json.success) {
                    setStorageValue('token', json.token);

                    this.setState({
                        SignInError: json.message,
                        isLoading: false,
                        SignInUsername: '',
                        token: json.token
                    });
                } else {
                    this.setState({
                        SignInError: json.message,
                        isLoading: false,
                    });
                }
        });
    }

    componentDidMount() {
        this.setState({
          isLoading: false
        });

        getStorageValue('token')
        .then(token => {
            if (token) {
                console.log('token: ' + JSON.stringify(token));
                this.setState({
                    token: token
                });
            }
        })
    }

    render() {
      const {
        isLoading,
        token,
        SignInError,
        SignInUsername
      } = this.state;

      // Loading Screen 
      if (isLoading) {
        return (<><Text>Loading...</Text></>);
      }

      // Login Screen
      if (!token) {
        return (
          <>
            {
            (SignInError) ? (
                <Text>{SignInError}</Text>
            ) : (null)
            }
            <Text>Enter your name</Text>
            <TextInput
                style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                onChangeText={(text) => { this.setState({ SignInUsername: text})}}
                value={SignInUsername}
            />
            <Button
                title="Play"
                onPress={() => this.SignIn()}
            />
         </>
        );
      }
    
      return (
        <View style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'stretch',
        }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <QRCodeScanner
                onRead={this.onSuccess}
                flashMode={RNCamera.Constants.FlashMode.torch}
                topContent={
                  <Text style={styles.centerText}>
                    Follow the clues to find the QR Code, then scan it for your next clue.
                  </Text>
                }
              />
            </View>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Hints />
          </View>
          <Button
            title="Clear Token"
            onPress={() => clearStorageValue('token')}
          />
        </View>
      );
    }
};
