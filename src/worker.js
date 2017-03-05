process.on('message', function(data) {
    var canvasData = data.canvasData;

    var length = data.length;
    var index = data.index;

    var transform = new Function('return ' + data.transform)();
    transform(canvasData.data, length, data.options);

    process.send({
        result: canvasData,
        index: index
    });
});
