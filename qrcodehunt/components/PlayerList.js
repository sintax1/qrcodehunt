import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet
} from 'react-native';
import { ListItem, Icon } from 'react-native-elements'

export class PlayerList extends Component {
    constructor(props) {
        super(props);
    };

    render() {
        console.log('players: ' + JSON.stringify(this.props.players));

        return (
            <View>
                {(this.props.players) ? (
                Object.keys(this.props.players).map(key => (
                <ListItem
                    key={key}
                    leftAvatar={<Icon
                        color='#a2acbd'
                        size={40}
                        name={ this.props.players[key].isReady ? 'smile' : 'dizzy' }
                        type='font-awesome-5'
                        color={ this.props.players[key].isReady ? 'green' : '#a2acbd' }
                      />}
                    title={key}
                    titleStyle={{fontSize: 40}}
                    containerStyle={ this.props.players[key].isReady ? {backgroundColor: '#f0fff4'} : {backgroundColor: '#fff1f0'}}
                    bottomDivider
                />
                ))
            ) : (null)}
            </View>
        )
    }
};

const styles = StyleSheet.create({

});