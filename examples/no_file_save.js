const Raspistill = require('node-raspistill').Raspistill;
const raspistill = new Raspistill({
    width: 640,
    height: 480,
    noFileSave: true
});

raspistill.takePhoto('first')
    .then((photo) => {
        console.log('took first photo', photo);
    })
    .catch((error) => {
        console.error('something bad happened', error);
    });