var imageFilterCore = require('../src/index');

function transform(data, length, options) {
    var hex = (options.color.charAt(0) === '#') ? options.color.substr(1) : options.color;
    var colorRGB = {
        r: parseInt(hex.substr(0, 2), 16),
        g: parseInt(hex.substr(2, 2), 16),
        b: parseInt(hex.substr(4, 2), 16)
    };

    for (var i = 0; i < length; i += 4) {
        data[i] -= (data[i] - colorRGB.r) * (options.level / 100);
        data[i + 1] -= (data[i + 1] - colorRGB.g) * (options.level / 100);
        data[i + 2] -= (data[i + 2] - colorRGB.b) * (options.level / 100);
    }
}

function applyResults(selector, canvas, context, src) {
    var target = document.querySelectorAll(selector)[0];
    var image = document.createElement('img');
    image.setAttribute('src', imageFilterCore.convertImageDataToCanvasURL(src));
    target.appendChild(image);
}

window.onload = function () {
    var img = new Image;
    img.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var context = canvas.getContext('2d');
        context.drawImage(img, 0, 0);

        var data = context.getImageData(0, 0, img.width, img.height);

        imageFilterCore.apply(data, transform, { color: '#008080', level: 50 }, 4)
            .then(function (results) {
                applyResults('#target-1', canvas, context, results);
            });
    };

    img.src = 'dummy.jpg';
};
