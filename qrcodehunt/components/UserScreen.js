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
    }

    SignIn() {
        // Grab state
        const {
            SignInUsername,
        } = this.state;

        this.setState({
          isLoading: true,
        });

        // Post request to backend
        fetch('http://192.168.7.254:3000/api/upload', {
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
                this.setState({
                    SignInError: json.message,
                    isLoading: false,
                    SignInUsername: ''
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
                <p>{SignInError}</p>
            ) : (null)
            }
            <Text>Sign In</Text>
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
        </View>
      );
    }
};
