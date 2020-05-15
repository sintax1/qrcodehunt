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
import RNFetchBlob from 'rn-fetch-blob';

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
        console.log('handleSaveHint: ' + JSON.stringify(photo));

        RNFetchBlob.fetch('POST', 'http://192.168.7.253:3000/api/hint', {
        'Content-Type': 'multipart/form-data',
        },
        createFormData(photo, {
            data: JSON.stringify(data)
        })
        )
        .then(response => response.json())
        .then(response => {
            resolve({
                success: true,
                response: response
            });
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
        savePictureCallback: this.props.savePictureCallback
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
        photo,
      } = this.state;

      return (
        <>
          <View style={styles.CameraContainer}>
            <View style={{flex: 2}}>
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
              <TouchableOpacity onPress={this.takePicture.bind(this)} style={styles.capture}>
                <Text style={{ fontSize: 14 }}> SNAP </Text>
              </TouchableOpacity>
            </View>
            
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              {photo && (
                <React.Fragment>
                  <View style={{flex: 1, marginTop: 10}}>
                    <Image
                      source={{ uri: photo.uri }}
                      style={{ width: 168, height: 200 }}
                    />
                  </View>
                  
                  <View style={{flex: 0, flexDirection: 'row'}}>
                    <TextInput style = {styles.input}
                    backgroundColor="white"
                    underlineColorAndroid = "transparent"
                    placeholder = "Hint Text (optional)"
                    placeholderTextColor = "#9dc0f5"
                    autoCapitalize = "none"
                    alignSelf = "flex-end"
                    onChangeText = {this.handleHintText}/>
                  </View>
                  <View style={{flex: 0, marginBottom: 20, flexDirection: 'row'}}>
                    <Button color="red" title="Save Hint" onPress={() => this.handleSave()} />
                  </View>
                </React.Fragment>
                
              )}
              {/*<Button title="Choose Photo" onPress={this.handleChoosePhoto} />*/}
            </View>
            </View>
          </>
      )
    }
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
  CameraContainer: {
    paddingTop: 10,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#347deb'
  },
  preview: {
    flex: 1,
    width: 400,
    alignSelf: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    bottom: 50
  },
  input: {
    flex: 1,
    margin: 15,
    height: 40,
    borderWidth: 1
 }
});