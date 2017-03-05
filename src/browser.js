require('es6-promise/auto');
var worker = require('./worker');

/**
* It returns a canvas with the given width and height
* @name getCanvas
* @param {Number} w - width
* @param {Number} h - height
* @returns {Object}
*/
function getCanvas(w, h) {
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    return canvas;
}

/**
* Given a ImageData it returns the dataURL
* @name convertImageDataToCanvasURL
* @param {ImageData} imageData
* @returns {String}
*/
function convertImageDataToCanvasURL(imageData) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);

    return canvas.toDataURL();
}

/**
* Transforms the body of a function into a string
* This is used to require the worker function and create a new Blob
* @method  extractBodyFunction
* @param   {Function} fn
* @returns {String}
*/
function extractBodyFunction(fn) {
    return fn.toString().trim().match(
        /^function\s*\w*\s*\([\w\s,]*\)\s*{([\w\W]*?)}$/
    )[1];
}

/**
 * Creates a Worker from the contents in ./worker.js
 * @method  createWorker
 * @returns {Worker}
 */
function createWorkerURL() {
    var functionBody = extractBodyFunction(worker);
    var blob = new Blob([functionBody], { type: 'text/javascript' });

    return window.URL.createObjectURL(blob);
}

/**
 * Creats transformation ObjectURL so that this function
 * can be imported in the worker
 * @method  createTransformation
 * @param   {Function} transform
 * @returns {String}
 */
function createTransformation(transform) {
    var blob = new Blob(['' + transform], { type: 'text/javascript' });

    return window.URL.createObjectURL(blob);
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
    var transformationURL = createTransformation(transform);
    var workerURL = createWorkerURL();
    var canvas = getCanvas(data.width, data.height);
    var context = canvas.getContext('2d');
    var finished = 0;
    var blockSize;

    // Drawing the source image into the target canvas
    context.putImageData(data, 0, 0);

    // Minimum number of workers = 1
    if (!nWorkers) {
        nWorkers = 1;
    }

    // Height of the picture chunck for every worker
    blockSize = Math.floor(canvas.height / nWorkers);

    return new Promise(function (resolve) {
        var w;
        var height;
        var canvasData;

        for (var index = 0; index < nWorkers; index++) {
            w = new Worker(workerURL);

            w.addEventListener('message', function (e) {
                // Data is retrieved using a memory clone operation
                var resultCanvasData = e.data.result;

                // Copying back canvas data to canvas
                // If the first webworker  (index 0) returns data, apply it at pixel (0, 0) onwards
                // If the second webworker  (index 1) returns data, apply it at pixel (0, canvas.height/4) onwards, and so on
                context.putImageData(resultCanvasData, 0, blockSize * e.data.index);

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
            w.postMessage({
                canvasData: canvasData,
                index: index,
                length: height * canvas.width * 4,
                options: options,
                transformationURL: transformationURL
            });
        }
    });
}

module.exports = {
    apply: apply,
    convertImageDataToCanvasURL: convertImageDataToCanvasURL,
    getCanvas: getCanvas
};
