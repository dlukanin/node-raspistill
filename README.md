# node-raspistill
[![Build Status](https://travis-ci.org/dlukanin/node-raspistill.svg?branch=master)](https://travis-ci.org/dlukanin/node-raspistill)
[![Coverage Status](https://coveralls.io/repos/github/dlukanin/node-raspistill/badge.svg?branch=master)](https://coveralls.io/github/dlukanin/node-raspistill?branch=master)

Simple wrapper for taking photos using Raspberry Pi raspistill app.

Module is written in typescript and provides type definitions out-of-the-box.

Tested with Raspberry Pi 2 B (Raspbian OS), and Raspberry Camera Module v2.

## Requirements
Raspbian OS with node.js v 6+ installed, raspberry camera module connected to your pi.


## Usage

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

You can also find some usage examples here: https://github.com/dlukanin/node-raspistill/tree/master/examples

## Changelog

#### v 0.0.16
Deps update. Added new parameters for camera options ([#10](https://github.com/dlukanin/node-raspistill/pull/10), [#11](https://github.com/dlukanin/node-raspistill/pull/11))

#### v 0.0.15
Deps update. Fixes in setting camera options methods ([thx for mentioning it in PR](https://github.com/dlukanin/node-raspistill/pull/8))

#### v 0.0.14
Some fixes in dependencies.

#### v 0.0.13
New options ([thx for PR](https://github.com/dlukanin/node-raspistill/pull/7)): time, shutterspeed, contrast, brightness, saturation, iso.

#### v 0.0.12
Added raspistill stop method.

#### v 0.0.11
Timelapse mode. Something like beta version, can be unstable in some cases. 
Feel free to submit issue if you think that mode doesn't work well in your project.

#### v 0.0.10
Added noFileSave option. 
If you don't want to save photos on your raspberry pi - use this option.

Some bug fixes and new examples.

#### v 0.0.9
Fixed some issues with width/height options.
Added setDefaultOptions method.
Updated some dependencies.

#### v 0.0.8
Added noPreview option.

## Docs
### Raspistill
#### constructor(options?: ICameraOptions)
Creates new Raspistill instance.

Options - object, that can contain:

|key|type|defaults|desc|
|---|---|---|---|
|noFileSave|boolean|false|Disables photos saving. If true - camera output will be directly sent as Buffer without saving on the drive|
|verticalFlip|boolean|false|   |
|horizontalFlip|boolean|false|   |
|noPreview|boolean|true|Disables preview window on Pi while taking photo|
|outputDir|string|'./photos'|Output directory where photos will be stored|
|fileName|string|undefined|Name for photo file. If undefined - photos file names will be calculated as new Date.now() + file encoding|
|encoding|string|'jpg'|'jpg', 'bpm', 'gif' or 'png'|
|width|number|undefined|Width of taken image in pixels. If width is not set - raspistill uses default max camera sensor resolution width|
|height|number|undefined|Height of taken image in pixels. If height is not set - raspistill uses default max camera sensor resolution height|
|time|number|undefined|Time before camera takes photo. If undefined raspistill util use it's own 5 sec timeout|
|shutterspeed|number|undefined|Shutter speed in microseconds|
|contrast|number|undefined|Contrast of the image (-100 ... 100). If undefined - raspistill util use contrast 0 value |
|brightness|number|undefined|Brightness of the image. 50 is the default raspistill util value.|
|saturation|number|undefined|Image saturation (-100 ... 100). Raspistill util uses 0 value if undefined|
|iso|number|undefined|Capture ISO (100 ... 800)|
|rotation|number|undefined|Image rotation param|
|awb|string|undefined|'off', 'auto', 'sun', 'cloud', 'shade', 'tungsten', 'fluorescent', 'incandescent', 'flash', 'horizon'|
|awbg|string|undefined|Sets blue and red gains (as floating point numbers) to be applied when awb=off. e.g. '1.5,1.2'|

```
const camera = new Raspistill({
    verticalFlip: true,
    fileName: 'foo'
});
```

You can find more info about raspistill util options in the official docs: https://www.raspberrypi.org/documentation/raspbian/applications/camera.md


#### takePhoto(fileName?: string): Promise\<Buffer\>
Takes new photo. Returns Promise, resolving with Buffer object.
```
camera.takePhoto('testPhotoName').then((photo) => {
    ...
});
```

#### timelapse(fileName: string, intervalMs: number, execTimeMs: number, cb: (image: Buffer) => any): Promise\<void\>;
#### timelapse(intervalMs: number, execTimeMs: number, cb: (image: Buffer) => any): Promise\<void\>;
Runs camera in timelapse mode. Passes taken image picture as Buffer object to the callback. 
Raspistill options (passed into constructor or into setOptions method) are also applicable in this mode.

Remember that raspberry camera has it's own limits of taking photos speed even in timelapse mode.

Check out official raspistill docs (https://www.raspberrypi.org/documentation/raspbian/applications/camera.md) for
file naming rules and interval/total exec time params usage.

```
camera.timelapse(500, 3000, (image) => {
    // got image from camera, do something
}).then(() => {
    // timelapse ended
}).catch((err) => {
    // something bad happened
});
```
or
```
camera.timelapse('image%04d', 500, 3000, (image) => {
    // got image from camera, do something
}).then(() => {
    // timelapse ended
}).catch((err) => {
    // something bad happened
});
```

#### stop(): void;
Tries to stop current raspistill running action. Note that pending raspistill promises will be
rejected with RaspistillInterruptError if stop was completed.
```
const RaspistillInterruptError = require('node-raspistill').RaspistillInterruptError;

raspistill.timelapse(1000, 30000, (image) => {
    console.log('got photo, trying to stop raspistill');
    raspistill.stop();
})
    .then(() => {
        console.log('timelapse ended')
    })
    .catch((err) => {
        console.log(err instanceof RaspistillInterruptError) // true, raspistill was interrupted;
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