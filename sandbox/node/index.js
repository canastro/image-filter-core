const imageFilterCore = require('../../src');
const request = require('request').defaults({ encoding: null });
var Canvas = require('canvas');


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


request.get('http://lorempixel.com/400/200/cats/1', function (error, response, body) {
    if (error || response.statusCode !== 200) {
        return;
    }

    const data = 'data:' + response.headers['content-type'] + ';base64,' + new Buffer(body).toString('base64');
    var img = new Canvas.Image();
    img.src = data;

    imageFilterCore.apply(img, transform, { color: '#008080', level: 50 }, 4)
        .then(results => {
            console.log('transformed');
            // var base64Data = req.rawBody.replace(/^data:image\/png;base64,/, '');

            require('fs').writeFile('out.png', results, 'base64', function(err) {
                console.log(err);
            });
        });
});
