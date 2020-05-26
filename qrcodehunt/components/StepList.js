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
import { Icon } from 'react-native-elements'
import { normalize } from '../utils';


function Step({step, editStep, deleteStep, enableEditing}) {
  // TODO: Add onpress event to allow user to edit the step. set step and hint number in state.
  // when the user is done editing a step the next step to be edited should be a new step, not the next one.
  // Will need to add logic to go to the next empty step.
  return (
    <View style={styles.item}>
      <Text style={styles.label}>Step #{step.item.number}</Text>
      <Image
        source={{ uri: step.item.photo.uri }}
        style={{ width: normalize(168), height: normalize(200) }}
      />
      {(enableEditing) ? (
        <>
          <Icon
            size={normalize(16)}
            reverse={true}
            color={'#403f4c'}
            name={ 'create' }
            type='material'
            onPress={() => editStep(step.item.number)}
            containerStyle={{ position: 'absolute', bottom: 0, left: 10 }}
          />
          <Icon
            size={normalize(16)}
            reverse={true}
            color={'#df2935'}
            name={ 'delete-forever' }
            type='material'
            onPress={() => deleteStep(step.item.number)}
            containerStyle={{ position: 'absolute', bottom: 0, right: 30 }}
          />
        </>
      ) : (null)}
      
    </View>
  );
}

export class StepList extends Component {
    constructor(props) {
        super(props);
    };

    render() {
      const {
        stepList,
        editStep,
        deleteStep,
        enableEditing
      } = this.props;

      return (
        <SafeAreaView style={styles.container}>
          <FlatList
            data={stepList}
            renderItem={(item) => <Step
              step={item}
              editStep={editStep}
              deleteStep={deleteStep}
              enableEditing={enableEditing}
            />}
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
    paddingLeft: normalize(10),
    marginVertical: normalize(5)
  },
  label: {
    fontSize: normalize(16),
  },
});
