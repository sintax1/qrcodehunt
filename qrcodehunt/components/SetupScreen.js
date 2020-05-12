import React, { Component } from 'react';
import { RNCamera } from 'react-native-camera';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';
import {
    Button,
    Text,
    TouchableOpacity,
    Image,
    View,
    TextInput
} from 'react-native';
import { styles } from '../styles';
import { getStorageValue, setStorageValue, clearStorageValue } from '../utils/storage';

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
  
export class SetupScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
          isLoading: true,
          isAdmin: false,
          token: '',
          SignInError: '',
          SignInPassword: '',
          photo: null,
        };
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
      }

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

    handleUploadPhoto = () => {
      RNFetchBlob.fetch('POST', 'http://192.168.7.253:3000/api/upload', {
      //RNFetchBlob.fetch('POST', 'http://192.168.7.62:3000/api/upload', {
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
      const {
        isLoading,
        token,
        photo,
        isAdmin,
        SignInError,
        SignInPassword
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