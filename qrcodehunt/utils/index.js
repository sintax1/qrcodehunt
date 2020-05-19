exports.randomColor = function() {
    var h = rand(1, 340);
    var s = 100;
    var l = 60;
    return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}

function rand(min, max) {
    return min + Math.random() * (max - min);
}
