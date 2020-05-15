import React, { Component } from 'react';
import {
    Text,
    Button,
    FlatList,
    SafeAreaView,
    View,
    TouchableOpacity
} from 'react-native';
import { styles } from '../styles';

function Hunt({ id, title, selectHunt }) {
  return (
    <TouchableOpacity onPress={selectHunt}>
    <View style={styles.hint} >
      <Text style={styles.hinttitle}>{title}</Text>
    </View>
    </TouchableOpacity>
  );
}

export class HuntList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dialogVisible: false,
            selectedHunt: {}
        };
    };

    showDialog = () => {
        this.setState({ dialogVisible: true });
    };

    handleOK = () => {
        this.setState({ dialogVisible: false });
        alert('selectedHunt: ' + this.state.selectedHunt);
    };

    handleDialogText = (text) => {
        this.setState({ selectedHunt: { name: text } });
    };

    render() {
      return (
        <>
          <Text>Hunt List</Text>
          <SafeAreaView style={styles.hintcontainer}>
            <FlatList
                data={this.props.hunts}
                renderItem={({ item }) => <Hunt
                    id={item.id}
                    title={item.title}
                    selectHunt={() => this.props.selectHunt(item.id)} />}
                keyExtractor={item => item.id}
                numColumns={4}
            />
          </SafeAreaView>
        </>
      )
    }
};