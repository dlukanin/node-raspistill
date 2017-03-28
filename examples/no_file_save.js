const Raspistill = require('node-raspistill').Raspistill;
const fs = require('fs');
const raspistill = new Raspistill({
    width: 640,
    height: 480,
    noFileSave: true,
    encoding: 'png'
});

raspistill.takePhoto('first')
    .then((photo) => {
        console.log('took first photo', photo);
        fs.writeFile('1.png', photo, function (err) {
            if (err) {
                throw err;
            }

            console.log('saved photo');
        })
    })
    .catch((error) => {
        console.error('something bad happened', error);
    });