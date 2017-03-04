# node-raspistill
[![Build Status](https://travis-ci.org/dlukanin/node-raspistill.svg?branch=master)](https://travis-ci.org/dlukanin/node-raspistill)

Simple wrapper for taking photos using Raspberry Pi raspistill app.

Module is written in typescript and provides type definitions out-of-the-box.

Tested with Raspberry Pi 2 B (Raspbian OS), and Raspberry Camera Module v2.

##Usage

```
npm install node-raspistill
```

```
const Raspistill = require('node-raspistill').Raspistill;
const camera = new Raspistill();

camera.takePhoto().then((photo) => {
    ...
});
```
Or (if you use imports):
```
import {Raspistill} from 'node-raspistill';
const camera = new Raspistill();

camera.takePhoto().then((photo) => {
    ...
});
```

You can also pass some options to constructor method:

```
const camera = new Raspistill({
    verticalFlip: true,
    width: 800,
    height: 600
});
```

See full options list in the docs below.

##Changelog

####v 0.0.9
Fixed some issues with width/height options.
Added setDefaultOptions method.
Updated some dependencies.

####v 0.0.8
Added noPreview option.

##Docs
###Raspistill
#### constructor(options?: ICameraOptions)
Creates new Raspistill instance.

Options - object, that can contain:

|key|type|defaults|desc|
|---|---|---|---|
|verticalFlip|boolean|false|   |
|horizontalFlip|boolean|false|   |
|noPreview|boolean|true|Disables preview window on Pi while taking photo|
|outputDir|string|'./photos'|Output directory where photos will be stored|
|fileName|string|new Date.now() + file encoding|Name for photo file|
|encoding|string|'jpg'|'jpg', 'bpm', 'gif' or 'png'|
|width|number|undefined|Width of taken image in pixels. If width is not set - raspistill uses default max camera sensor resolution width|
|height|number|undefined|Height of taken image in pixels. If height is not set - raspistill uses default max camera sensor resolution height|

```
const camera = new Raspistill({
    verticalFlip: true,
    fileName: 'foo'
});
```


#### takePhoto(fileName?: string): Promise\<Buffer\>
Takes new photo. Returns Promise, resolving with Buffer object.
```
camera.takePhoto('testPhotoName').then((photo) => {
    ...
});
```

#### setOptions(options: ICameraOptions): void
Sets new options for current Raspistill instance.
```
camera.setOptions({
    horizontalFlip: true,
    noPreview: false
});
```

#### setDefaultOptions(): void
Reverts all option values of current Raspistill instance to default.
Default values are presented in the options table.

#### getOptions(): ICameraOptions
Gets current raspistill options.

#### getOption(key: string): any
Gets current raspistill option by key.