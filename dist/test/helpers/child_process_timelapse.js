"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var imageGenerator = require("js-image-generator");
var counter = 0;
function generateImage() {
    if (counter <= 4) {
        imageGenerator.generateImage(100 + Math.floor(Math.random() * 20), 50, 40, function (err, image) {
            if (err) {
                throw err;
            }
            process.stdout.write(image.data, function () {
                counter++;
                generateImage();
            });
        });
    }
}
generateImage();
