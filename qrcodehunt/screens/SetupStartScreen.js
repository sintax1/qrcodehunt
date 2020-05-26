import React, { Component } from 'react';
import { HuntList } from '../components/HuntList';
import { getAllHunts } from '../api';
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
          message: 'Select a Hunt to edit or create a new Hunt',
          huntList: []
        }
    }

    componentDidMount() {

      getAllHunts()
      .then(resp => {
        if (resp.success) {
          console.log("Success getting hunts:", resp)
            let emptyCells = new Array(resp.hunts.length % 4)
            .fill({name: ''})

            resp.hunts.push(...emptyCells);
          this.setState({
            huntList: resp.hunts
          })
        } else {
          console.log('Error getting all Hunts');
        }
      })
    }

    selectHunt = (hunt) => {
      console.log("id", hunt)
      fetch('http://192.168.7.253:3000/api/hunt/' + hunt._id, {
          method: 'GET'
      })
      .then(res => res.json())
      .then(json => {
          console.log('selectHunt:', json);
          if (json.success) {
            this.props.navigation.navigate('Hunt Settings', {
              hunt: json.hunt
            });
          } else {
              console.log('failed to retrieve hunt');
          }
      });
    }

    render() {
      const {
        message,
        huntList
      } = this.state;

      let context = this.context;

      return (
        <>
          <View style={styles.header}>
              <Text style={styles.headerText}>{message}</Text>
          </View>

          <HuntList selectHunt={this.selectHunt} huntList={huntList} />
          
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