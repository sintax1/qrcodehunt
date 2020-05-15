import React, { Component } from 'react';
import {
    Text,
    View,
    TextInput,
    Button,
    Alert,
    TouchableOpacity,
    StyleSheet
  } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { getStorageValue, setStorageValue, clearStorageValue } from '../utils/storage';
import { HuntList } from '../components/HuntList';
import { GlobalContext } from '../context';
import CustomTextInput from '../components/TextInput';

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
        isFocused: false
      };
    }
  
    /*
    componentWillUnmount() {
      // Save context in storage
      console.log('Saving context: ' + JSON.stringify(this.context));
      setStorageValue('context', JSON.stringify(this.context));
    }
    */

    SignIn = () => {
        const {
            SignInUsername,
        } = this.state;

        this.setState({
          isLoading: true
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
                    //setStorageValue('token', json.token);

                    this.setState({
                        SignInError: json.message,
                        isLoading: false
                    });

                    this.context.setToken(json.token);
                } else {
                    this.setState({
                        SignInError: json.message,
                        isLoading: false,
                    });
                }
        });
    }

    restoreContext = () => {
      // Restore context from storage
      getStorageValue('context')
      .then(context => {
        if (context) {
          this.context = JSON.parse(context);
        }
        console.log("Restored context: " + JSON.stringify(this.context));
      })
    }

    componentDidMount = () => {
      console.log('DefaultScreen mounted')

        this.setState({
          isLoading: false
        });

        //this.restoreContext();

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

        /*
        getStorageValue('token')
        .then(token => {
            if (token) {
                this.context.token = token;
            }
        })
        */
    }

    selectHunt = (id) => {
        this.setState({ selectedHunt: id });
    }

    render() {
      const {
        isLoading,
        SignInError,
        SignInUsername,
        selectedHunt
      } = this.state;

      //this.restoreContext();

      console.log('defaultscreen context: ' + JSON.stringify(this.context));

      // Loading Screen 
      if (isLoading) {
        return (<><Text>Loading...</Text></>);
      }

      // Login Screen
      if (!this.context.token) {
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
         </View>
        );
      }

      if (selectedHunt == null) {
        return (
          <>
            <HuntList selectHunt={this.selectHunt} hunts={this.context.hunts} />
            <Text>{this.context.token}</Text>
            <Button
              title="Clear Context"
              onPress={() => clearStorageValue('context')}
            />
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
        </View>
      );
    }
};
DefaultScreen.contextType = GlobalContext;

export default DefaultScreen;

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