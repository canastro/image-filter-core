![build status](https://travis-ci.org/canastro/image-filter-threshold.svg?branch=master)
[![Dependency Status](https://dependencyci.com/github/canastro/image-filter-core/badge)](https://dependencyci.com/github/canastro/image-filter-core)
[![npm version](https://badge.fury.io/js/image-filter-threshold.svg)](https://badge.fury.io/js/image-filter-threshold)
[![codecov](https://codecov.io/gh/canastro/image-filter-core/branch/master/graph/badge.svg)](https://codecov.io/gh/canastro/image-filter-core)

# image-filter-core
Small library that relies on webworkers to apply image transformations.

There are several modules that use `image-filter-core`, such as:
* [image-filters](https://www.npmjs.com/package/image-filters)
* [image-filter-brightness](https://www.npmjs.com/package/image-filter-brightness)
* [image-filter-contrast](https://www.npmjs.com/package/image-filter-contrast)
* [image-filter-grayscale](https://www.npmjs.com/package/image-filter-grayscale)
* [image-filter-threshold](https://www.npmjs.com/package/image-filter-threshold)
* [image-filter-sepia](https://www.npmjs.com/package/image-filter-sepia)
* [image-filter-invert](https://www.npmjs.com/package/image-filter-invert)
* [image-filter-gamma](https://www.npmjs.com/package/image-filter-gamma)
* [image-filter-colorize](https://www.npmjs.com/package/image-filter-colorize)

But you can easily create your own transformation function and rely on `image-filter-core` to handle the webworkers and to split the work.

## Install
```
npm install image-filter-core --save
```

## Methods
### # getCanvas()
It returns a canvas with the given width and height
```js
var imageFilterCore = require('image-filter-core');
var canvas = imageFilterCore.getCanvas(100, 100);
```

### # convertImageDataToCanvasURL()
Given a ImageData it returns the dataURL
```js
var imageFilterCore = require('image-filter-core');
var canvasURL = imageFilterCore.convertImageDataToCanvasURL(imageData);
```

### # apply()
Provide the ImageData, the transformation function, the options to be passed to the transformation function and the number of workers to split the work.

```js
var imageFilterCore = require('image-filter-core');

imageFilterCore.apply(data, transform, options, nWorkers)
    .then(function (imageData) {
        // Do whatever you want with imageData
    });
```

The transform function receives ImageData, the length of data to transform and the options that the developer provided to image-fiter-core, example transformation function for the threshold effect:

```js
function transform (data, length, options) {
    for (var i = 0; i < length; i += 4) {
        var r = data[i];
        var g = data[i + 1];
        var b = data[i + 2];
        var v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= options.threshold) ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = v;
    }
}
```
