const Raspistill = require('node-raspistill').Raspistill;
const RaspistillInterruptError = require('node-raspistill').RaspistillInterruptError;
const fs = require('fs');

const raspistill = new Raspistill({
    fileName: 'image%04d',
    encoding: 'jpg',
    width: 640,
    height: 480
});

let i = 0;
raspistill.timelapse(1000, 30000, (image) => {
    i++;
    console.log('got ' + i + ' photo');
    if (i === 5) {
        console.log('trying to stop');
        raspistill.stop();
    }
})
    .then(() => {
        console.log('timelapse ended');
    })
    .catch((err) => {
        console.log('probably stopped, checking error');
        console.log(err instanceof RaspistillInterruptError); // true, raspistill was interrupted;
    });