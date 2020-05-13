import React, { Component } from 'react';
import { HuntList } from '../components/HuntList';
import { GlobalContext } from '../context';
  
export class SetupStartScreen extends Component {
    constructor(props) {
      super(props);
    }

    render() {
      let context = this.context;

      console.log('SetupStartScreen context: ' + JSON.stringify(context));

      return (
        <HuntList
          selectHunt={this.selectHunt}
          hunts={context.hunts}
          isAdmin={context.isAdmin} />
      );
    };
};
SetupStartScreen.contextType = GlobalContext;