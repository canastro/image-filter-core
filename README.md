![build status](https://travis-ci.org/canastro/image-filter-threshold.svg?branch=master)
[![npm version](https://badge.fury.io/js/image-filter-threshold.svg)](https://badge.fury.io/js/image-filter-threshold)
[![codecov](https://codecov.io/gh/canastro/image-filter-core/branch/master/graph/badge.svg)](https://codecov.io/gh/canastro/image-filter-core)

# image-filter-core
Core module used by image-filter's modules that exports helper functions.


## Install
```
npm install image-filter-core --save
```

## Methods
### getCanvas
It returns a canvas with the given width and height
```
var imageFilterCore = require('image-filter-core');
var canvas = imageFilterCore.getCanvas(100, 100);
```

### convertImageDataToCanvasURL
Given a ImageData it returns the dataURL
```
var imageFilterCore = require('image-filter-core');
var canvasURL = imageFilterCore.convertImageDataToCanvasURL(imageData);
```

### apply
Given a worker file with the transformation the work is split between the configured number of workers and the transformation is applied returning a Promise

```
var webworkify = require('webworkify');
var imageFilterCore = require('image-filter-core');
var worker = require('./transformation-worker');

var imageData = imageFilterCore.apply(
    worker,
    nWorkers,
    canvas,
    context,
    params
);
```
