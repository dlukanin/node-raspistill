const Raspistill = require('node-raspistill').Raspistill;
const raspistill = new Raspistill();

raspistill.takePhoto()
    .then((photo) => {
        console.log('took photo', photo);
    })
    .catch((error) => {
        console.error('something bad happened', error);
    });