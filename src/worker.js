module.exports = function (self) {
    self.addEventListener('message', function (e) {
        importScripts(e.data.transformationURL);

        var canvasData = e.data.canvasData;

        var length = e.data.length;
        var index = e.data.index;

        transform(canvasData.data, length, e.data.options);

        self.postMessage({
            result: canvasData,
            index: index
        });

        self.close();
    });
};
