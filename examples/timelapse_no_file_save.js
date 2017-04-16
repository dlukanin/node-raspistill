const Raspistill = require('node-raspistill').Raspistill;
const fs = require('fs');

const raspistill = new Raspistill({
    noFileSave: true,
    encoding: 'jpg',
    width: 640,
    height: 480
});

let i = 0;
raspistill.timelapse(1000, 30000, (image) => {
    i++;
    fs.writeFile('image' + i + '.jpg', image, {encoding: 'binary'}, function (err) {
        if (err) {
            throw err;
        }

        console.log('saved photo ' + i);
    });
})
    .then(() => {
        console.log('timelapse ended')
    })
    .catch((err) => {
        console.log('something bad happened', err);
    });