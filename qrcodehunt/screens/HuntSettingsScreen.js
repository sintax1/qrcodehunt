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

      // Populate the hunt data if we are editing a Hunt
      if (this.props.route.params.hunt) {
        let hunt = this.props.route.params.hunt;
        this.state = {
          id: hunt._id,
          name: hunt.name,
          timer: hunt.timer.toString(),
          isRandom: hunt.isRandom,
          steps: hunt.steps
        }
      } else {
        this.state = {
          id: '',
          name: '',
          timer: '5',
          isRandom: false,
          steps: []
        }
      }
    }

    handleName = (name) => {
      this.setState({name: name});
    }

    // Save changes to existing Hunt
    save = (id) => {
      fetch('http://192.168.7.253:3000/api/hunt/' + id, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              name: this.state.name,
              timer: this.state.timer,
              isRandom: this.state.isRandom
          }),
      })
      .then(res => res.json())
      .then(json => {
          console.log('save res:', json);
          if (json.success) {
              this.setState({
                  id: json.hunt._id
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

    // Create a new Hunt
    create = () => {
      fetch('http://192.168.7.253:3000/api/hunt', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              name: this.state.name,
              timer: this.state.timer,
              isRandom: this.state.isRandom
          }),
      })
      .then(res => res.json())
      .then(json => {
          console.log('create res:', json);
          if (json.success) {
              this.setState({
                  id: json.hunt._id
              });

              console.log('save: ' + JSON.stringify(this.state));
              this.props.navigation.navigate('Edit Hunt', {
                hunt: this.state
              });
          } else {
              console.log('failed to create the Hunt');
          }
      });
    }

    handleRandom = (value) => {
      this.setState({isRandom: value});
    }

    handleTimer = (value) => {
      if (value === '' || /^\d+$/.test(value)) {
        this.setState({
          timer: value
        });
      }
    }

    render() {
      return (
        <View style = {styles.container}>
            <Text> Name of the Hunt </Text>
            <TextInput style = {styles.input}
               underlineColorAndroid = "transparent"
               placeholder = "Hunt Name"
               placeholderTextColor = "#9dc0f5"
               autoCapitalize = "none"
               value={this.state.name}
               onChangeText = {this.handleName}/>

            <Text> Time to wait between each Hint (minutes) </Text>
            <TextInput style = {styles.input}
               keyboardType='numeric'
               numericvalue
               value={this.state.timer}
               onChangeText = {this.handleTimer}/>

            <View style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 4}}>
              <Text> Randomize Steps </Text>
              <Switch
                trackColor={{ false: "#767577", true: "#d91616" }}
                thumbColor={this.state.isRandom ? "#347deb" : "#f4f3f4"}
                ios_backgroundColor="#d91616"
                onValueChange={this.handleRandom}
                value={this.state.isRandom}
              />
              </View>
            
            <TouchableOpacity
               style = {styles.submitButton}
               onPress = {
                  () => (this.state.id) ? this.save(this.state.id) : this.create()
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