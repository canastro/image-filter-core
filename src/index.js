require('es6-promise/auto');
var Canvas = require('canvas');
var cp = require('child_process');

/**
* It returns a canvas with the given width and height
* @name getCanvas
* @param {Number} w - width
* @param {Number} h - height
* @returns {Object}
*/
function getCanvas(w, h) {
    return new Canvas(w, h);
}

/**
* Given a ImageData it returns the dataURL
* @name convertImageDataToCanvasURL
* @param {ImageData} imageData
* @returns {String}
*/
function convertImageDataToCanvasURL(imageData) {
    var canvas = new Canvas(imageData.width, imageData.height);
    var ctx = canvas.getContext('2d');
    ctx.drawImage(imageData, 0, 0);

    return canvas.toDataURL();
}

/**
* Given a worker file with the transformation the work is split
* between the configured number of workers and the transformation is applied
* returning a Promise
* @name apply
* @param {Function} worker
* @param {Number} options
* @returns {Promise}
*/
function apply(data, transform, options, nWorkers) {
    var canvas = getCanvas(data.width, data.height);
    var context = canvas.getContext('2d');
    var finished = 0;
    var blockSize;

    // Drawing the source image into the target canvas
    context.drawImage(data, 0, 0);

    // Minimum number of workers = 1
    if (!nWorkers) {
        nWorkers = 1;
    }

    // Height of the picture chunck for every worker
    blockSize = Math.floor(canvas.height / nWorkers);

    return new Promise(function (resolve) {
        var child;
        var height;
        var canvasData;

        for (var index = 0; index < nWorkers; index++) {
            child = cp.fork(__dirname + '/worker');

            child.on('message', function (data) {
                // Data is retrieved using a memory clone operation
                var img = new Canvas.Image();
                img.src = data.result;

                // Copying back canvas data to canvas
                // If the first webworker  (index 0) returns data, apply it at pixel (0, 0) onwards
                // If the second webworker  (index 1) returns data, apply it at pixel (0, canvas.height/4) onwards, and so on
                context.drawImage(img, 0, blockSize * data.index);

                finished++;

                if (finished === nWorkers) {
                    resolve(context.getImageData(0, 0, canvas.width, canvas.height));
                }
            });

            // In the last worker we have to make sure we process whatever is missing
            height = blockSize;
            if ((index + 1) === nWorkers) {
                height = canvas.height - (blockSize * index);
            }

            // Getting the picture
            canvasData = context.getImageData(0, blockSize * index, canvas.width, height);

            // Sending canvas data to the worker using a copy memory operation
            child.send({
                canvasData: canvasData,
                index: index,
                length: height * canvas.width * 4,
                options: options,
                transform: transform.toString()
            });
        }
    });
}

module.exports = {
    apply: apply,
    convertImageDataToCanvasURL: convertImageDataToCanvasURL,
    getCanvas: getCanvas
};
