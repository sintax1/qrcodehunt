import React, { Component } from 'react';
import {
    Text,
    StyleSheet,
    View
} from 'react-native';
import { HuntList } from '../components/HuntList';
import { GlobalContext } from '../context';
import { ws, getAllHunts } from '../api';
import { normalize } from '../utils';


export class SelectHuntScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            huntList: [],
            selectedHunt: null,
            message: 'Select a Hunt to join',
            player: null,
            hunt: null
        };
    }

    componentDidMount() {

        this.setState({
            player: {
                id: this.context.player.id,
                name: this.context.player.name
            }
        })

        // State updates
        ws.removeAllListeners('update');
        ws.on('update', data => {
            console.log('update: ' + JSON.stringify(data));
            this.setState(data);
        })

        // Listen for authorization to join room to join
        ws.removeAllListeners('joinAck');
        ws.on('joinAck', data => {
            console.log('joinAck: ' + JSON.stringify(data));
            this.setState({
                hunt: data.hunt
            });
            this.context.setHunt(data.hunt);
            this.props.navigation.navigate('Wait to Start', {
                hunt: data.hunt
            });
        });

        getAllHunts().then(resp => {
            if (resp.success) {
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
        console.log('Selected Hunt: ' + hunt._id);

        ws.emit('joinReq', {
            id: hunt._id,
            player: this.state.player
        });
    }
    
    render() {
        const {
            huntList,
            message,
            status
        } = this.state;

        return (
            <>
                <View style={styles.header}>
                    <Text style={styles.headerText}>{message}</Text>
                </View>
                <HuntList selectHunt={this.selectHunt} huntList={huntList} />
            </>
        )
    }
}

SelectHuntScreen.contextType = GlobalContext;

export default SelectHuntScreen;

const styles = StyleSheet.create({
    header: {
        flex: 0,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerText: {
        fontSize: normalize(40),
        fontWeight: "bold"
    }
});