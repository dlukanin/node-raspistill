const Raspistill = require('node-raspistill').Raspistill;
const fs = require('fs');
const raspistill = new Raspistill({
    noFileSave: true,
    encoding: 'bmp'
});

raspistill.takePhoto()
    .then((photo) => {
        console.log('took photo');
        fs.writeFile('1.bmp', photo, {encoding: 'binary'}, function (err) {
            if (err) {
                throw err;
            }

            console.log('saved photo');
        })
    })
    .catch((error) => {
        console.error('something bad happened', error);
    });