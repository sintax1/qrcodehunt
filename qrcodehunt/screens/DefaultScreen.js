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
import { HuntList } from '../components/HuntList';
import { GlobalContext } from '../context';


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
  
class DefaultScreen extends Component {
    constructor(props) {
      super(props);

      this.state = {
        isLoading: true,
        SignInError: '',
        SignInUsername: '',
        selectedHunt: null,
        hunts: []
      };

      subscribeToTest((err, data) => this.setState({ 
        SignInError: data 
      }));
    }
  
    componentWillUnmount() {
      // Save context in storage
      console.log('Saving context: ' + JSON.stringify(this.context));
      setStorageValue('context', JSON.stringify(this.context));
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
                        SignInUsername: ''
                    });

                    this.context.token = token;
                } else {
                    this.setState({
                        SignInError: json.message,
                        isLoading: false,
                    });
                }
        });
    }

    componentDidMount() {
      console.log('DefaultScreen mounted')

        this.setState({
          isLoading: false
        });

        // Restore context from storage
        getStorageValue('context')
        .then(context => {
          if (context) {
            this.context = JSON.parse(context);
          }
          console.log("Restored context: " + JSON.stringify(this.context));
        })

        // https://reactnavigation.org/docs/function-after-focusing-screen/#triggering-an-action-with-a-focus-event-listener
        const unsubscribe = this.props.navigation.addListener('focus', () => {
          console.log('DefaultScreen focused')
        });

        this.props.navigation.setOptions({
            headerRight: () => (
              <Button
                onPress={() => this.props.navigation.navigate('Setup')}
                title="Setup"
                color="#0068ad"
              />
            )
        });

        getStorageValue('token')
        .then(token => {
            if (token) {
                this.context.token = token;
            }
        })
    }

    selectHunt = (id) => {
        this.setState({ selectedHunt: id });
    }

    render() {
      const {
        isLoading,
        SignInError,
        SignInUsername,
        selectedHunt,
        hunts
      } = this.state;

      console.log('defaultscreen context: ' + JSON.stringify(this.context));

      // Loading Screen 
      if (isLoading) {
        return (<><Text>Loading...</Text></>);
      }

      // Login Screen
      if (!this.context.token) {
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

      if (selectedHunt == null) {
        return (
          <>
            <HuntList selectHunt={this.selectHunt} hunts={this.context.hunts} />
            <Text>{this.context.token}</Text>  
          </>
        )
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
DefaultScreen.contextType = GlobalContext;

export default DefaultScreen;
