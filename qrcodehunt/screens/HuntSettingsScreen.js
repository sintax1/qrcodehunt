import React, { Component } from 'react';
import {
    Text,
    View,
    TextInput,
    StyleSheet,
    Switch,
    TouchableOpacity
} from 'react-native';
import { GlobalContext } from '../context';
  
export class HuntSettingsScreen extends Component {
    constructor(props) {
      super(props);

      this.state = {
        id: '',
        name: '',
        timer: '5',
        isRandom: false,
        steps: []
      }
    }

    handleName = (name) => {
      this.setState({name: name});
    }

    save = () => {
      // Post request to backend
      fetch('http://192.168.7.253:3000/api/hunt', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              name: this.state.name
          }),
      })
      .then(res => res.json())
      .then(json => {
          console.log('json', json);
          if (json.success) {
              this.setState({
                  id: json.id
              });

              console.log('save: ' + JSON.stringify(this.state));
              this.props.navigation.navigate('Edit Hunt', {
                hunt: this.state
              });
          } else {
              console.log('failed to save hunt');
          }
      });
    }

    handleRandom = (value) => {
      this.setState({isRandom: value});
    }

    handleTimer = (value) => {
      if (/^\d+$/.test(value)) {
        this.setState({
          timer: value
        });
      }
    }

    render() {
      const {
        name,
        timer,
        isRandom
      } = this.state;

      return (
        <View style = {styles.container}>
            <Text> Name of the Hunt </Text>
            <TextInput style = {styles.input}
               underlineColorAndroid = "transparent"
               placeholder = "Hunt Name"
               placeholderTextColor = "#9dc0f5"
               autoCapitalize = "none"
               value={name}
               onChangeText = {this.handleName}/>

            <Text> Time to wait between each Hint (minutes) </Text>
            <TextInput style = {styles.input}
               keyboardType='numeric'
               numericvalue
               value={timer}
               onChangeText = {this.handleTimer}/>

            <View style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 4}}>
              <Text> Randomize Hints </Text>
              <Switch
                trackColor={{ false: "#767577", true: "#d91616" }}
                thumbColor={this.state.isRandom ? "#347deb" : "#f4f3f4"}
                ios_backgroundColor="#d91616"
                onValueChange={this.handleRandom}
                value={isRandom}
              />
              </View>
            
            <TouchableOpacity
               style = {styles.submitButton}
               onPress = {
                  () => this.save()
               }>
               <Text style = {styles.submitButtonText}> Save </Text>
            </TouchableOpacity>
         </View>
      );
    };
};
HuntSettingsScreen.contextType = GlobalContext;

const styles = StyleSheet.create({
  container: {
     paddingTop: 23
  },
  input: {
     margin: 15,
     height: 40,
     borderColor: '#d91616',
     borderWidth: 1
  },
  submitButton: {
     backgroundColor: '#d91616',
     padding: 10,
     margin: 15,
     height: 40,
  },
  submitButtonText:{
     color: 'white',
     alignSelf: 'center',
  }
});