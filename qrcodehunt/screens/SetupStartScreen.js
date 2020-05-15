import React, { Component } from 'react';
import { HuntList } from '../components/HuntList';
import {
  Button
} from 'react-native';
import { GlobalContext } from '../context';
  
export class SetupStartScreen extends Component {
    constructor(props) {
        super(props);
    }

    selectHunt = (id) => {
        this.setState({ selectedHunt: id });
    }

    render() {
      let context = this.context;

      console.log('SetupStartScreen context: ' + JSON.stringify(context));

      return (
        <>
        <HuntList
          selectHunt={this.selectHunt}
          hunts={context.hunts}
          isAdmin={context.isAdmin}
        />
        <Button
          onPress={() => this.props.navigation.navigate('Hunt Settings')}
          title="New Hunt"
          color="#0068ad"
        />
        </>
      );
    };
};
SetupStartScreen.contextType = GlobalContext;