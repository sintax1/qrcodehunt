import React, { Component } from 'react';
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    Image
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { GlobalContext } from '../context';
import { normalize } from '../utils';

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
            gameFinished: false
        })

        this.ws = this.context.ws;

        this.subscribeToMessages();

        this.ws.emit('getHint');
    }

    subscribeToMessages = () => {
        // Listen for hints
        this.ws.removeAllListeners('hint');
        this.ws.on('hint', data => {
            this.setState({
                hint: data.hint
            });
        });

        // Listen for finish signal
        this.ws.removeAllListeners('fin');
        this.ws.on('fin', () => {
            this.setState({
                hint: null,
                gameFinished: true
            });
        });

        // Listen for updates
        this.ws.removeAllListeners('update');
        this.ws.on('update', data => {
            console.log('update: ' + JSON.stringify(data));
            this.setState(data);
        })
    };

    handleScan = (scan) => {
        console.log('Scan: ' + JSON.stringify(scan));

        this.setState({
            enableScanner: false
        });

        this.ws.emit('code', {
            code: scan.data
        });
    }

    render() {
        const {
            status,
            message,
            hunt,
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
              <View style={styles.header}>
                  <Text style={styles.headerText}>{hunt.name}</Text>
                </View>
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
                        <Text style={{fontSize: normalize(40), color: '#fff'}}>Scan QR Code</Text>
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
    header: {
        flex: 0,
        padding: normalize(20),
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
        paddingBottom: normalize(20),
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