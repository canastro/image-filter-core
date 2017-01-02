import work from 'webworkify';

/**
 * @name getCanvas
 * @param {number} w - width
 * @param {number} h - height
 * @returns {object}
 */
export function getCanvas(w, h) {
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    return canvas;
}


/**
 * @name apply
 * @param {object} worker
 * @param {number} nWorkers
 * @param {object} canvas
 * @param {object} context
 * @param {number} params
 * @param {number} blockSize
 * @param {number} segmentLength
 * @returns {promise}
 */
export function apply(worker, nWorkers, canvas, context, params, blockSize, segmentLength) {
    let w;
    let finished = 0;

    return new Promise((resolve) => {
        for (let index = 0; index < nWorkers; index++) {
            w = work(worker);

            w.addEventListener('message', (e) => {
                // Data is retrieved using a memory clone operation
                const resultCanvasData = e.data.result;
                const index = e.data.index;

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
            const canvasData = context.getImageData(0, blockSize * index, canvas.width, blockSize);

            // Sending canvas data to the worker using a copy memory operation
            w.postMessage({
                data: canvasData,
                index,
                length: segmentLength,
                params
            });
        }
    });
}
