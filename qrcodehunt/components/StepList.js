import React, { Component } from 'react';
import {
    Text,
    View,
    Image,
    StyleSheet,
    FlatList,
    SafeAreaView
} from 'react-native';
import Constants from 'expo-constants';

function Step({step}) {
  // TODO: Add onpress event to allow user to edit the step. set step and hint number in state.
  // when the user is done editing a step the next step to be edited should be a new step, not the next one.
  // Will need to add logic to go to the next empty step.
  return (
    <View style={styles.item}>
      <Text>Step #{step.item.number}</Text>
      <Image
        source={{ uri: step.item.photo.uri }}
        style={{ width: 168, height: 200 }}
      />
    </View>
  );
}

export class StepList extends Component {
    constructor(props) {
        super(props);
    };

    render() {
      const {
        stepList
      } = this.props;

      return (
        <SafeAreaView style={styles.container}>
          <FlatList
            data={stepList}
            renderItem={(item) => <Step step={item} />}
            keyExtractor={item => item.photo.id}
          />
        </SafeAreaView>
      )
    }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16
  },
  title: {
    fontSize: 32,
  },
});
