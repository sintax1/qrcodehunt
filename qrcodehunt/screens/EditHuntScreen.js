import React, { Component } from 'react';
import { EditHint, handleSaveHint } from '../components/EditHint';
import { GlobalContext } from '../context';
import {
  Text,
  View,
  StyleSheet,
  Button
} from 'react-native';
import { StepList } from '../components/StepList';
import { adminsignout, getPhoto, saveQRCode, deleteStep } from '../api';
import { normalize } from '../utils';
import { clearStorageValue } from '../utils/storage';

export class EditHuntScreen extends Component {
    constructor(props) {
      super(props);

      const { hunt } = this.props.route.params;

      this.state = {
        hunt: hunt,
        message: `The Hunt will have several player steps. Each step will have 3 hints which the player will receive in order.
Take a picture of the first hint to get started.`,
        step: hunt.steps.length+1,
        hint: 1,
        hintText: '',
        photo: null,
        doneEnabled: true,
        stepList: [],
        QRScannerEnabled: false,
        lastPhotoId: null
      };

      if (hunt.steps) {
        this.formatStepList(hunt.steps).then(resp => {
          this.setState({
            stepList: resp
          })
        })
      }
    }

    formatStepList = (steps) => {
      return Promise.all(steps.map((step, idx) => {
        return getPhoto(step.hints[0][0].photo).then(resp => {
          return {
            number: idx + 1,
            photo: resp.photo
          }
        })
      }))
    }

    takePictureCallback = () => {
      this.setState({
        message: 'Save the hint or retake the photo',
        doneEnabled: false
      });
    }

    // User clicked Save Hint button
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

        // Save successful
        if (response.success && response.hintid && response.stepid) {
          
          this.setState({
            photo: null,
            lastPhotoId: response.photo.id
          })

          // Step is not finished yet, add more hints
          if (response.hintid < 3) {
            this.setState({
              message: 'Success! Take another photo for step #' + response.stepid + ', hint #' + (response.hintid + 1),
              hint: response.hintid + 1,
              doneEnabled: false
            });
          } else {
            // Last hint added
  
            this.setState({
              message: 'Now, scan a QR Code and hide it for Step #' + response.stepid,
              QRScannerEnabled: true
            });
          }
        } else {
          // Save unsuccessful
          this.setState({
            message: 'Failed to save the hint. Try again.'
          });
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

          // Get the contents of photo
          getPhoto(this.state.lastPhotoId).then(resp => {
            this.state.stepList.splice(this.state.step - 1, 1, { number: this.state.step, photo: resp.photo })
            this.setState({
              message: 'Success! You finished all hints for step #' + this.state.step + '. Continue taking photos to add more hints, or click Done to finish.',
              doneEnabled: true,
              QRScannerEnabled: false,
              step: this.state.step + 1,
              hint: 1,
              stepList: this.state.stepList
            });
          })
          
        } else {
          this.setState({
            message: 'Something went wrong. Try again.'
          });
        }
      })
    }

    clearUserData = () => {
      this.context.setPlayer(null);
      this.context.setAdmin(false);

      clearStorageValue('player');
    }

    handleDone = () => {
      adminsignout(this.context.player.id).then(resp => {
        if (resp.success) {
          this.clearUserData();
        }
      })
    }

    handleEdit = (stepid) => {
      console.log('clicked on step:', stepid);
      this.setState({
        step: stepid
      })
    }

    handleDelete = (stepid) => {
      console.log('deleting step:', stepid);

      deleteStep(this.state.hunt.id, stepid).then(resp => {
        // Delete step successful
        if (resp.success) {
          console.log('delete successful')

          this.state.stepList.splice(stepid-1, 1);

          this.setState({
            message: 'Deleted step #' + stepid,
            stepList: this.state.stepList,
            step: this.state.stepList.length+1,
          })
        }
      })
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
              <Text style={styles.smallText}> Hunt Name: {hunt.name} </Text>
              <Text style={styles.smallText}> Hunt ID: {hunt.id} </Text>
              <Text style={styles.smallText}> Step: {step} </Text>
              <Text style={styles.smallText}> Hint: {hint} </Text>
            </View>
          </View>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <View style={{flex: 1, flexDirection: 'column', borderRightWidth: 1}}>
              <StepList
                stepList={stepList}
                editStep={this.handleEdit}
                deleteStep={this.handleDelete}
                enableEditing={doneEnabled}
              />
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
                <Button color='#0068ad' title="Done" onPress={() => this.handleDone()} />
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
    padding: normalize(20),
    backgroundColor: 'powderblue'
  },
  message: {
    fontSize: normalize(18)
  },
  smallText: {
    fontSize: normalize(14)
  }
})