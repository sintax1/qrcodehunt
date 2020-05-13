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
    render() {
      return (
        <>
          <Text>Hunt List</Text>
          <SafeAreaView style={styles.hintcontainer}>
            <FlatList
                data={this.props.hunts}
                renderItem={({ item }) => <Hunt id={item.id} title={item.title} selectHunt={() => this.props.selectHunt(item.id)} />}
                keyExtractor={item => item.id}
                numColumns={4}
            />
          </SafeAreaView>
          <Button
                title="New Hunt"
                onPress={() => this.props.newHunt()}
          />
        </>
      )
    }
};