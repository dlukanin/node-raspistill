const Raspistill = require('node-raspistill').Raspistill;
const RaspistillInterruptError = require('node-raspistill').RaspistillInterruptError;
const fs = require('fs');

const raspistill = new Raspistill({
    fileName: 'image%04d',
    encoding: 'jpg',
    width: 640,
    height: 480
});

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