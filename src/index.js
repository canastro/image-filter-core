require('es6-promise/auto');
var work = require('webworkify');

/**
 * It returns a canvas with the given width and height
 * @name getCanvas
 * @param {Number} w - width
 * @param {Number} h - height
 * @returns {Object}
 */
exports.getCanvas = function (w, h) {
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    return canvas;
};

/**
 * Given a ImageData it returns the dataURL
 * @name convertImageDataToCanvasURL
 * @param {ImageData} imageData
 * @returns {String}
 */
exports.convertImageDataToCanvasURL = function (imageData) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);

    return canvas.toDataURL();
};


/**
 * Given a worker file with the transformation the work is splitted
 * between the configured number of workers and the transformation is applied
 * returning a Promise
 * @name apply
 * @param {Object} worker
 * @param {Number} nWorkers
 * @param {Object} canvas
 * @param {Object} context
 * @param {Number} params
 * @param {Number} blockSize
 * @param {Number} segmentLength
 * @returns {Promise}
 */
exports.apply = function (worker, nWorkers, canvas, context, params, blockSize, segmentLength) {
    var w;
    var finished = 0;

    return new Promise(function (resolve) {
        for (var index = 0; index < nWorkers; index++) {
            w = work(worker);

            w.addEventListener('message', function (e) {
                // Data is retrieved using a memory clone operation
                var resultCanvasData = e.data.result;
                var index = e.data.index;

                // Copying back canvas data to canvas
                // If the first webworker  (index 0) returns data, apply it at pixel (0, 0) onwards
                // If the second webworker  (index 1) returns data, apply it at pixel (0, canvas.height/4) onwards, and so on
                context.putImageData(resultCanvasData, 0, blockSize * index);

                finished++;

                if (finished === nWorkers) {
                    resolve(context.getImageData(0, 0, canvas.width, canvas.height));
                }
            });

            // Getting the picture
            var canvasData = context.getImageData(0, blockSize * index, canvas.width, blockSize);

            // Sending canvas data to the worker using a copy memory operation
            w.postMessage({
                data: canvasData,
                index: index,
                length: segmentLength,
                params: params
            });
        }
    });
};
