import React, { Component } from 'react';
import ImagePicker from 'react-native-image-picker';
import {
    Text,
    TouchableOpacity,
    Image,
    View,
    Button,
    StyleSheet,
    TextInput
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import QRCodeScanner from 'react-native-qrcode-scanner';
import RNFetchBlob from 'rn-fetch-blob';
import { normalize } from '../utils';


const createFormData = (photo, data) => {
    const formdata = [];
  
    const b64data = RNFetchBlob.wrap(photo.uri);
  
    formdata.push({
      name : 'photo',
      filename : 'hint.jpg',
      type:'image/jpeg',
      data: b64data
    });
  
    Object.keys(data).forEach(key => {
        formdata.push({name: key, data: data[key]});
    });
  
    return formdata;
};

exports.handleSaveHint = (photo, data) => {
    return new Promise((resolve, reject) => {
        RNFetchBlob.fetch('POST', 'http://192.168.7.253:3000/api/hint', {
        'Content-Type': 'multipart/form-data',
        },
        createFormData(photo, {
            data: JSON.stringify(data)
        })
        )
        .then(response => response.json())
        .then(response => {
            resolve(response);
        })
        .catch(error => {
            console.log('upload error', error);
            reject({
                success: false,
                error: error
            });
        });
    });
};

export class EditHint extends Component {
    constructor(props) {
      super(props);

      this.state = {
        photo: null,
        hintText: '',
        takePictureCallback: this.props.takePictureCallback,
        savePictureCallback: this.props.savePictureCallback,
        QRCodeCallback: this.props.QRCodeCallback
      };
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
        const options = { quality: 0.1 };
        const data = await this.camera.takePictureAsync(options);
        if (data.uri) {
          this.setState({ photo: data });
          this.state.takePictureCallback()
        }
      }
    };

    handleHintText = (value) => {
      this.setState({ hintText: value });
    };

    handleSave() {
      this.state.savePictureCallback(this.state);
      this.setState({
        photo: null,
        hintText: ''
      })
    }

    render() {
      const {
        photo
      } = this.state;

      const {
        QRScannerEnabled
      } = this.props;

      return (
          <View style={styles.CameraContainer}>
            <View style={{flex: 1, justifyContent: 'center'}}>
              {(QRScannerEnabled) ? (
                <QRCodeScanner
                  cameraStyle={{width: normalize(200), height: normalize(400), alignSelf: 'center'}}
                  onRead={(e) => this.state.QRCodeCallback(e)}
                  topContent={
                    <Text style={styles.centerText}>
                      Scan a QR Code for this Step
                    </Text>
                  }
                />
              ) : (
                <>
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
                />
                <TouchableOpacity onPress={this.takePicture.bind(this)} style={styles.capture}>
                  <Text style={{ fontSize: normalize(14) }}> SNAP </Text>
                </TouchableOpacity>
                </>
              )}
              
            </View>
            
            <View style={{ flex: 1}}>
              {photo && (
                <>
                  <View style={{flex: 2, justifyContent: 'center', alignContent: 'center', alignItems: 'center', marginTop: normalize(10)}}>
                    <Image
                      source={{ uri: photo.uri }}
                      style={{ width: normalize(160), height: normalize(220) }}
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <View style={{flex: 1, flexDirection: 'row'}}>
                      <TextInput style = {styles.input}
                        backgroundColor="white"
                        underlineColorAndroid = "transparent"
                        placeholder = "Hint Text (optional)"
                        placeholderTextColor = "#9dc0f5"
                        autoCapitalize = "none"
                        alignSelf = "flex-end"
                        onChangeText = {this.handleHintText}/>
                    </View>
                    <View style={{flex: 1, justifyContent: 'center', flexDirection: 'row'}}>
                      <Button color="red" title="Save Hint" onPress={() => this.handleSave()} />
                    </View>
                  </View>

                </>
              )}
              {/*<Button title="Choose Photo" onPress={this.handleChoosePhoto} />*/}
            </View>
          </View>
      )
    }
}

const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: normalize(18),
    padding: normalize(32),
    color: '#777'
  },
  textBold: {
    fontWeight: '500',
    color: '#000'
  },
  buttonText: {
    fontSize: normalize(21),
    color: 'rgb(0,122,255)'
  },
  CameraContainer: {
    paddingTop: normalize(10),
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#347deb'
  },
  preview: {
    flex: 1,
    width: normalize(200),
    alignSelf: 'center',
  },
  capture: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: normalize(15),
    alignSelf: 'center',
    position: 'absolute',
    bottom: 10
  },
  input: {
    flex: 1,
 }
});