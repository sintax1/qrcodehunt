import { Dimensions, Platform, PixelRatio } from 'react-native';

const {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  } = Dimensions.get('window');
  
// based on iphone 5s's scale
const scale = SCREEN_WIDTH / 600;

exports.normalize = function(size) {
    const newSize = size * scale 
    if (Platform.OS === 'ios') {
        return Math.round(PixelRatio.roundToNearestPixel(newSize))
    } else {
        return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2
    }
}

exports.randomColor = function() {
    var h = rand(1, 340);
    var s = 100;
    var l = 60;
    return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}

function rand(min, max) {
    return min + Math.random() * (max - min);
}
