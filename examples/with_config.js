const Raspistill = require('node-raspistill').Raspistill;
const raspistill = new Raspistill({
    width: 640,
    height: 480
});

raspistill.takePhoto('first')
    .then((photo) => {
        console.log('took first photo', photo);
        raspistill.setOptions({
            verticalFlip: true
        });
        return raspistill.takePhoto('second');
    })
    .then((photo) => {
        console.log('took second photo', photo);
    })
    .catch((error) => {
        console.error('something bad happened', error);
    });