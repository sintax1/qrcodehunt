import React, { Component } from 'react';
import { EditHint } from '../components/EditHint';
import { GlobalContext } from '../context';
import { handleSaveHint } from '../components/EditHint';
import {
  Text,
  View,
  StyleSheet,
  Button
} from 'react-native';
import { StepList } from '../components/StepList';
import { getPhoto, saveQRCode } from '../api';

export class EditHuntScreen extends Component {
    constructor(props) {
      super(props);

      const { hunt } = this.props.route.params;
      
      this.state = {
        hunt: hunt,
        message: `The Hunt will have several player steps. Each step will have 3 hints which the player will receive in order.
Take a picture of the first hint to get started.`,
        step: 1,
        hint: 1,
        hintText: '',
        photo: null,
        doneEnabled: false,
        stepList: [],
        QRScannerEnabled: false
      };
    }

    takePictureCallback = () => {
      this.setState({
        message: 'Save the hint or retake the photo'
      });
    }

    saveHint() {
      const {
        hunt,
        step,
        hint,
        hintText
      } = this.state;

      this.setState({
        message: 'Saving Hint. Please wait...'
      });

      handleSaveHint(this.state.photo, {
        hunt,
        step,
        hint,
        hintText
      }).then((response) => {
        if (this.state.hint < 3) {
          // Step is not finished yet, add more hints
          this.setState({
            message: 'Success! Take another photo for step #' + this.state.step + ', hint #' + (this.state.hint + 1),
            photo: null,
            hint: this.state.hint + 1,
            doneEnabled: false
          });
        } else {
          // Last hint added

          // Get the contents of photo
          getPhoto(response.photo.id).then(resp => {
            this.setState({
              message: 'Now, scan a QR Code and hide it for Step #' + this.state.step,
              QRScannerEnabled: true,
              photo: null,
              hint: 1,
              stepList: [...this.state.stepList, { number: this.state.step, photo: resp.photo } ]
            });
          })
        }
      })
      .catch((error) => {
        console.log('promise error: ' + JSON.stringify(error));
        this.setState({
          message: 'Something went wrong. Try again.'
        });
      })
    }

    savePictureCallback = (data) => {
     this.setState(data, this.saveHint);
    }

    QRCodeCallback = capture => {
      saveQRCode({
        hunt: this.state.hunt,
        step: this.state.step,
        qrcode: capture.data
      }).then(resp => {
        if (resp.success) {
          this.setState({
            message: 'Success! You finished all hints for step #' + this.state.step + '. Continue taking photos to add more hints, or click Done to finish.',
            doneEnabled: true,
            QRScannerEnabled: false,
            step: this.state.step + 1
          });
        } else {
          this.setState({
            message: 'Something went wrong. Try again.'
          });
        }
      })
    }

    handleDone = () => {
      this.context.setToken(null);
    }

    render() {
      const {
        message,
        hunt,
        step,
        hint,
        doneEnabled,
        stepList,
        QRScannerEnabled
      } = this.state;
      
      return (
        <View style={{flex: 1, flexDirection: 'column'}}>
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{message}</Text>
            <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center'}}>
              <Text style={{ fontSize: 14 }}> Hunt Name: {hunt.name} </Text>
              <Text style={{ fontSize: 14 }}> Hunt ID: {hunt.id} </Text>
              <Text style={{ fontSize: 14 }}> Step: {step} </Text>
              <Text style={{ fontSize: 14 }}> Hint: {hint} </Text>
            </View>
          </View>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <View style={{flex: 1, flexDirection: 'column', borderRightWidth: 1}}>
              <StepList stepList={stepList} />
            </View>
            <View style={{
              flex: 2,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'stretch'
            }}>
              
              <View style={{flex: 1}}>
                <EditHint
                  takePictureCallback={this.takePictureCallback}
                  savePictureCallback={this.savePictureCallback}
                  QRCodeCallback={this.QRCodeCallback}
                  QRScannerEnabled={QRScannerEnabled}
                  />
              </View>
              
            </View>
            </View>
            {(doneEnabled) ? (
              <View style={{flex: 0, justifyContent: 'flex-end' }}>
                <Button color='#0068ad' title="Done" onPress={this.handleDone} />
              </View>
            ) : (null)}
        </View>
      );
    };
};
EditHuntScreen.contextType = GlobalContext;

const styles = StyleSheet.create({
  messageContainer: {
    flex: 0,
    padding: 20,
    backgroundColor: 'powderblue'
  },
  message: {
    fontSize: 18
  }
})