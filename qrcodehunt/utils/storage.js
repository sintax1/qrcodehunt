import AsyncStorage from '@react-native-community/async-storage';

exports.getStorageValue = async(key) => {
    try {
        const value = await AsyncStorage.getItem(key);
        if (value != null)
            return value;
    } catch (error) {
        console.error(error);
    }
}

exports.setStorageValue = async(key, value) => {
    try {
        await AsyncStorage.setItem(
            key,
            value
        );
    } catch (error) {
        console.error(error);
    }
}

exports.clearStorageValue = async(key) => {
    console.log('clearing: ' + key)
    try {
        await AsyncStorage.removeItem(
            key
        );
    } catch (error) {
        console.error(error);
    }
}