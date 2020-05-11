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
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  View
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';

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
  onSuccess = e => {
    console.error(e.data);
    /*Linking.openURL(e.data).catch(err =>
      console.error('An error occured', err)
    );*/
  };

  render() {
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

const createFormData = (photo, body) => {
  const data = [];

  const b64data = RNFetchBlob.wrap(photo.uri);

  data.push({
    name : 'photo',
    filename : 'photo-filename.jpg',
    type:'image/jpeg',
    data: b64data
  });

  Object.keys(body).forEach(key => {
    data.push({name: key, data: body[key]});
  });

  return data;
};

class SetupScreen extends Component {
  state = {
    photo: null,
  }
  
  handleUploadPhoto = () => {
    RNFetchBlob.fetch('POST', 'http://192.168.7.62:3000/api/upload', {
      'Content-Type': 'multipart/form-data',
      },
      createFormData(this.state.photo, { userId: '123' })
    )
    .then(response => response.json())
    .then(response => {
      console.log('upload succes', response);
      alert('Upload success!');
      this.setState({ photo: null });
    })
    .catch(error => {
      console.log('upload error', error);
      alert('Upload failed!');
    });
  };

  handleChoosePhoto = () => {
    const options = {
      noData: true,
    };
    ImagePicker.launchImageLibrary(options, response => {
      if (response.uri) {
        this.setState({ photo: response });
      }
    });
  };

  takePicture = async () => {
    if (this.camera) {
      const options = { quality: 0.1, base64: true };
      const data = await this.camera.takePictureAsync(options);
      if (data.uri) {
        this.setState({ photo: data });
      }
    }
  };

  render() {
    const { photo } = this.state
    return (
      <View style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'stretch',
      }}>
        <View style={styles.container}>
          <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            style={styles.preview}
            captureAudio={false}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.on}
            androidCameraPermissionOptions={{
              title: 'Permission to use camera',
              message: 'We need your permission to use your camera',
              buttonPositive: 'Ok',
              buttonNegative: 'Cancel',
            }}
            onGoogleVisionBarcodesDetected={({ barcodes }) => {
              console.log(barcodes);
            }}
          />
          <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
            <TouchableOpacity onPress={this.takePicture.bind(this)} style={styles.capture}>
              <Text style={{ fontSize: 14 }}> SNAP </Text>
            </TouchableOpacity>
          </View>
        </View>
          
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {photo && (
            <React.Fragment>
              <Image
                source={{ uri: photo.uri }}
                style={{ width: 300, height: 300 }}
              />
              <Button title="Upload" onPress={this.handleUploadPhoto} />
            </React.Fragment>
          )}
          <Button title="Choose Photo" onPress={this.handleChoosePhoto} />
        </View>

      </View>
    )
  }
};

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

const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777'
  },
  textBold: {
    fontWeight: '500',
    color: '#000'
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)'
  },
  buttonTouchable: {
    padding: 16
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
    justifyContent: 'center',
    height: 100
  },
  preview: {
    flex: 1,
    width: 500,
    alignSelf: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
});

export default Screen;