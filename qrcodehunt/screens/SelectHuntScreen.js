import React, { Component } from 'react';
import {
    Text,
    StyleSheet,
    View
} from 'react-native';
import { HuntList } from '../components/HuntList';
import { GlobalContext } from '../context';
import { getAllHunts } from '../api';


export class SelectHuntScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            huntList: [],
            selectedHunt: null,
            message: 'test'
        };
    }

    componentDidMount() {
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
        console.log('Selected Hunt: ' + hunt._id)
        //this.setState({ selectedHunt: id });
        this.props.navigation.navigate('Wait to Start', {
            hunt: hunt
        });
    }
    
    render() {
        const {
            huntList,
            message
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
        fontSize:40,
        fontWeight: "bold"
    }
});