import React, { Component } from 'react';
import {
    Text,
    FlatList,
    View,
    TouchableOpacity,
    StyleSheet,
    Dimensions
} from 'react-native';
import { normalize, randomColor } from '../utils';

const numColumns = 4;

function Hunt({ id, name, selectHunt, getColor }) {
  return (
    (name) ? (
      <TouchableOpacity style={[styles.hunt, {backgroundColor: getColor}]} onPress={selectHunt}>
      
        <Text style={styles.title}>{name}</Text>
      
      </TouchableOpacity>
    ) : (
      <View style={[styles.hunt, {borderWidth: 0}]}></View>
    )
  );
}

export class HuntList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dialogVisible: false
        };
    };

    render() {
      return (
          <FlatList
              data={this.props.huntList}
              style={styles.container}
              renderItem={({ item }) => <Hunt
                  id={item.id}
                  name={item.name}
                  selectHunt={() => this.props.selectHunt(item)}
                  getColor={randomColor()} />}
              keyExtractor={item => item._id}
              numColumns={numColumns}
          />
      )
    }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 1
  },
  hunt: {
    flex: 1,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    height: normalize(Dimensions.get('window').width / numColumns / 2)
  },
  title: {
    fontSize: normalize(20)
  }
});