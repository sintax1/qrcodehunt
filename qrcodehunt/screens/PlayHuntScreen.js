import React, { Component } from 'react';
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    Image
} from 'react-native';
import { Icon } from 'react-native-elements'
import QRCodeScanner from 'react-native-qrcode-scanner';
import { GlobalContext } from '../context';
import { normalize } from '../utils';
import { BackHandler } from 'react-native';

class Hint extends Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        return (
            <>
            {this.props.hint && (
                <>
                <View style={{flex: 1}}>
                    {this.props.hint.photo && (
                        <Image
                            source={{ uri: this.props.hint.photo.uri }}
                            style={{ width: normalize(200), height: normalize(300) }}
                        />
                    )}
                </View>
                <View style={{flex: 0}}>
                    <Text style={styles.hintText}>{this.props.hint.text}</Text>
                </View>
                </>
            )}
            </>
        )
    }
}

export class PlayHuntScreen extends Component {
    constructor(props) {
        super(props);

        this.state = this.props.route.params;
    }

    handleScanButton = () => {
        this.setState({
            enableScanner: true
        })
    }

    componentDidMount() {
        this.setState({
            status: 'Follow the hints to find the Hidden Code',
            message: '',
            hint: null,
            enableScanner: false,
            gameFinished: false,
            ws: this.context.ws
        }, () => {
            this.subscribeToMessages();
            this.state.ws.emit('getHint');
        })

        // Remove the back button
        this.props.navigation.setOptions({
            title: this.state.hunt.name,
            headerLeft: null,
            gesturesEnabled: false
        });
    }

    subscribeToMessages = () => {

        console.log('1: ' + JSON.stringify(this.state.hunt))
        console.log('2: ' + JSON.stringify(this.context.hunt))

        const {
            hunt,
            player,
            ws
        } = this.state;

        // Error
        this.state.ws.removeAllListeners('error');
        this.state.ws.on('error', data => {
            console.log('Error: ' + JSON.stringify(data.error));
            // Exit the App
            BackHandler.exitApp();
        });

        // Reconnect
        this.state.ws.removeAllListeners('reconnect');
        this.state.ws.on('reconnect', function () {
            console.log('reconnect');
            console.log(hunt);
            
            ws.emit('player-reconnected', {
                hunt: hunt,
                player: player
            });
        });

        // Listen for hints
        this.state.ws.removeAllListeners('hint');
        this.state.ws.on('hint', data => {
            console.log('hint: ' + JSON.stringify(data.hint))
            this.setState({
                hint: data.hint
            });
        });

        // Listen for finish signal
        this.state.ws.removeAllListeners('fin');
        this.state.ws.on('fin', () => {
            this.setState({
                hint: null,
                gameFinished: true
            });
        });

        // Listen for updates
        this.state.ws.removeAllListeners('update');
        this.state.ws.on('update', data => {
            console.log('update: ' + JSON.stringify(data));
            this.setState(data);
        })
    };

    handleScan = (scan) => {
        console.log('Scan: ' + JSON.stringify(scan));

        this.setState({
            enableScanner: false
        });

        this.state.ws.emit('code', {
            code: scan.data
        });
    }

    render() {
        const {
            status,
            message,
            gameFinished,
            enableScanner
        } = this.state;

        return (
            <View style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'stretch',
            }}>
                <View style={styles.status}>
                  <Text style={styles.statusText}>{status}</Text>
                </View>
             {!gameFinished && 
                 <>
                <View style={styles.hints}>
                    <Hint hint={this.state.hint} />
                </View>
                <View style={styles.scanner}>
                    {(enableScanner) ? (
                    <QRCodeScanner
                        cameraStyle={{width: normalize(200), height: normalize(400), alignSelf: 'center'}}
                        onRead={(e) => this.handleScan(e)}
                        topContent={
                        <Text style={styles.scannerText}>
                            Scan a QR Code
                        </Text>
                        }
                    />
                    ) : (
                    <TouchableOpacity style={styles.button} onPress={() => this.handleScanButton()}>
                        <Text style={{fontSize: normalize(40), color: '#fff'}}>Scan </Text>
                        <Icon
                            size={normalize(40)}
                            name={'qrcode'}
                            type='font-awesome'
                            color={ '#fff' }
                      />
                    </TouchableOpacity>
                    )}
                </View>
                <View style={styles.message}>
                    <Text style={styles.messageText}>{message}</Text>
                </View>
                </>
            }
            </View>
        );
    }
}

PlayHuntScreen.contextType = GlobalContext;

export default PlayHuntScreen;

const styles = StyleSheet.create({
    status: {
        flex: 0,
        alignItems: 'center',
        justifyContent: 'center',
        padding: normalize(30),
        flexDirection: 'row'
    },
    statusText: {
        fontSize: normalize(20),
        textAlign: 'center'
    },
    hints: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        paddingTop: 10,
        borderTopWidth: 1
    },
    hintText: {
        fontSize: normalize(20)
    },
    scanner: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    scannerText: {
        color: '#0015ff',
        marginTop: normalize(20),
        fontWeight: 'bold',
        fontSize: normalize(20),
        zIndex: 1
    },
    button: {
        flex: 0,
        backgroundColor: 'green',
        borderRadius: 5,
        padding: normalize(15),
        paddingHorizontal: normalize(20),
        alignSelf: 'center',
        bottom: normalize(50)
    },
    message: {
        flex: 0,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: normalize(10),
        backgroundColor: '#347deb',
    },
    messageText: {
        fontSize: normalize(20),
        color: '#fff'
    }
});