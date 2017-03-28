const Raspistill = require('node-raspistill').Raspistill;
const raspistill = new Raspistill({
    width: 640,
    height: 480,
    noFileSave: true
});

raspistill.takePhoto('first')
    .then((photo) => {
        console.log('took first photo', photo);
        fs.writeFile('message.txt', 'Hello Node.js', 'utf8', callback);

    })
    .catch((error) => {
        console.error('something bad happened', error);
    });