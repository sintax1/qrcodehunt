import AsyncStorage from '@react-native-community/async-storage';

exports.getStorageValue = async(key) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key)
        return jsonValue != null ? JSON.parse(jsonValue) : null
    } catch (error) {
        console.error(error);
    }
}

exports.setStorageValue = async(key, value) => {
    try {
        const jsonValue = JSON.stringify(value)
        await AsyncStorage.setItem(key, jsonValue)
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