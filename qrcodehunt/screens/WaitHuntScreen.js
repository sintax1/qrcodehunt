import React, { Component } from 'react';
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { GlobalContext } from '../context';
import { ws } from '../api';
import { PlayerList } from '../components/PlayerList';
import { normalize } from '../utils';

export class WaitHuntScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            status: 'Waiting for the Hunt to start',
            message: '',
            hunt: this.props.route.params.hunt,
            isControl: false,
            player: {},
            isReady: false,
            players: {},
            huntinProgress: false
        };

        this._isMounted = false;
    }

    componentDidMount() {
        const {
            hunt
        } = this.state;

        this._isMounted = true;

        this.context.setWebsocket(ws);

        this.setState({
            player: {
                id: this.context.player.id,
                name: this.context.player.name
            }
        }, () => {
            this.subscribeToMessages();

            ws.emit('joinHunt', {
                id: this.state.hunt,
                player: this.state.player
            });
        });
    }
    
    componentWillUnmount() {
        const {
            hunt,
            player
        } = this.state;

        console.log(JSON.stringify(this.state.hunt));

        // Commenting this out since hitting the back button removes player from the room and won't let them back in.
        //this._isMounted && this.leaveHunt({id: this.state.hunt, player: player})

        this._isMounted = false;
    }

    subscribeToMessages = () => {
        // Listen for new players that join the hunt
        ws.removeAllListeners('playerJoin');
        ws.on('playerJoin', data => {
            let player = JSON.parse(data);
            console.log(player.name + ' joined the Hunt');

            this.setState(state => ({
                ...state,
                message: player.name + ' joined the Hunt',
                players: {
                    ...state.players,
                    [player.name]: {
                        isReady: player.isReady
                    }
                }
            }));
        });

        // Player Ready
        ws.removeAllListeners('playerReady');
        ws.on('playerReady', data => {
            let player = JSON.parse(data);
            console.log(player.name + ' is ready');

            this.setState(state => ({
                ...state,
                message: 'Player ' + player.name + ' is ready',
                players: {
                    ...state.players,
                    [player.name]: {
                        isReady: true
                    }
                }
            }));
        })

        // State updates
        ws.removeAllListeners('update');
        ws.on('update', data => {
            console.log('update: ' + JSON.stringify(data));
            this.setState(data);
        })

        // Player List
        ws.removeAllListeners('players');
        ws.on('players', playersArr => {
            console.log('ws.players: ' + JSON.stringify(playersArr));

            var players = playersArr.reduce(function(map, obj) {
                map[obj.name] = { isReady: obj.isReady };
                return map;
            }, {});

            console.log('players transform: ' +JSON.stringify(players));

            this.setState(state => ({
                ...state,
                players: players
            }));
        })

        // Begin the Hunt
        ws.removeAllListeners('beginHunt');
        ws.on('beginHunt', () => {
            this.setState({
                huntinProgress: true
            });
            this.props.navigation.navigate('Hunt', this.state);
        });

        // Player left
        ws.removeAllListeners('playerLeft');
        ws.on('playerLeft', data => {
            let player = JSON.parse(data);
            console.log(player.name + ' left the Hunt');
            console.log(this.state.players);

            this.setState(state => ({
                ...state,
                message: player.name + ' left the Hunt',
                players: Object.keys(state.players)
                    .filter(name =>name != player.name)
                    .reduce((obj, key) => {
                        obj[key] = state.players[key];
                        return obj;
                    }, {})
            }), () => {
                console.log(this.state.players);
            });
        });
    }

    leaveHunt = ({id, player}) => {
        console.log('leaveHunt: ' + id + ', ' + JSON.stringify(player));
        
        ws.emit('leaveHunt', {
            id: id,
            player: player
        });
    }

    handleReady = () => {
        console.log('ready')
        ws.emit('ready');
    }

    render() {
        const {
            status,
            message,
            hunt,
            isReady
        } = this.state;

        return (
            <View style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
              //alignItems: 'stretch',
            }}>
                <View style={styles.header}>
                  <Text style={styles.headerText}>{hunt.name}</Text>
                </View>
                <View style={styles.status}>
                  <Text style={styles.statusText}>{status}</Text>
                </View>
                <View style={styles.playerList}>
                    <PlayerList players={this.state.players} />
                </View>
                <View>
                    {(!isReady) ? (
                        <TouchableOpacity style={styles.button} disabled={isReady} onPress={() => this.handleReady()}>
                            <Text style={{fontSize: normalize(40), color: '#fff'}}>Ready</Text>
                        </TouchableOpacity>
                    ) : (null)}
                </View>
                <View style={styles.message}>
                  <Text style={styles.messageText}>{message}</Text>
                </View>
            </View>
        );
    }
}

WaitHuntScreen.contextType = GlobalContext;

export default WaitHuntScreen;

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
    },
    status: {
        flex: 0,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 20
    },
    statusText: {
        fontSize: normalize(40)
    },
    playerList: {
        flex:1,
        margin: 20,
    },
    button: {
        flex: 0,
        backgroundColor: 'green',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        bottom: 50
    },
    message: {
        flex: 0,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: 10,
        backgroundColor: '#347deb',
    },
    messageText: {
        fontSize: normalize(20),
        color: '#fff'
    }
});