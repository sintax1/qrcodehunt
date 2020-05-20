import React, { Component } from 'react';
import { HuntList } from '../components/HuntList';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity
} from 'react-native';
import { GlobalContext } from '../context';
import { normalize } from '../utils';


export class SetupStartScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
          message: 'Select a Hunt to edit or create a new Hunt'
        }
    }

    selectHunt = (id) => {
        this.setState({ selectedHunt: id });
    }

    render() {
      const {
        message
      } = this.state;

      let context = this.context;

      console.log('SetupStartScreen context: ' + JSON.stringify(context));

      return (
        <>
        <View style={styles.header}>
            <Text style={styles.headerText}>{message}</Text>
        </View>

        <View style={{flex:1, alignItems: 'center', justifyContent: 'center' }}>
          <HuntList
            selectHunt={this.selectHunt}
            hunts={context.hunts}
            isAdmin={context.isAdmin}
          />
        </View>
        
        <View style={{flex:1, alignItems: 'center', justifyContent: 'center' }}>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('Hunt Settings')} style={styles.button}>
            <Text style={{ fontSize: 40, color: '#fff' }}> New Hunt </Text>
          </TouchableOpacity>
        </View>
        </>
      );
    };
};
SetupStartScreen.contextType = GlobalContext;

const styles = StyleSheet.create({
  header: {
      flex: 0,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center'
  },
  headerText: {
      fontSize: normalize(40),
      fontWeight: "bold",
      textAlign: 'center'
  },
  button: {
    flex: 0,
    backgroundColor: '#347deb',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    bottom: 50
  }
});