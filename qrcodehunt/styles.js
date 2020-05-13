import {
    StyleSheet
} from 'react-native';
  
export const styles = StyleSheet.create({
    centerText: {
      flex: 1,
      fontSize: 18,
      padding: 32,
      color: '#777'
    },
    textBold: {
      fontWeight: '500',
      color: '#000'
    },
    buttonText: {
      fontSize: 21,
      color: 'rgb(0,122,255)'
    },
    buttonTouchable: {
      padding: 16
    },
    container: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: 'black',
      justifyContent: 'center',
      height: 100
    },
    preview: {
      flex: 1,
      width: 500,
      alignSelf: 'center',
    },
    capture: {
      flex: 0,
      backgroundColor: '#fff',
      borderRadius: 5,
      padding: 15,
      paddingHorizontal: 20,
      alignSelf: 'center',
      margin: 20,
    },

    hintcontainer: {
      flex: 1,
      marginTop: 10,
    },
    hint: {
      backgroundColor: '#f9c2ff',
      padding: 20,
      marginVertical: 8,
      marginHorizontal: 16,
    },
    hinttitle: {
      fontSize: 32,
    },
});