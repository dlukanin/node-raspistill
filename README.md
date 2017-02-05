# node-raspistill
Simple wrapper for taking photos using Raspberry Pi raspistill app.

Module is written in typescript and provides type definitions out-of-the-box.

Tested with Raspberry Pi 2 B (Raspbian OS), and Raspberry Camera Module v2.

##Usage

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
##Docs
### new Raspistill(options?): Raspistill instance
Options - object, that can contain:

`verticalFlip`: boolean, defaults to false;

`horizontalFlip`: boolean, defaults to false;

`outputDir`: string, output directory where photos will be stored. Defaults to `./photos`;

`fileName`: string, name for photo file, if not exixts, defaults to new Date.now() + file encoding;

`encoding`: string, photo encoding, can be 'jpg', 'bpm', 'gif', 'png', defaults to `jpg`;

`width`: number, not exists by default;

`height`: number, not exists by default;

### {Raspistill instance}.takePhoto(fileName?: string): Promise<Buffer>
