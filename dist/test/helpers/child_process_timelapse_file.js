"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var imageGenerator = require("js-image-generator");
var fs = require("fs");
var counter = 0;
function generateImage() {
    var val = Math.floor(Math.random() * 20);
    if (counter <= 4) {
        imageGenerator.generateImage(100 + val, 50, 40, function (err, image) {
            if (err) {
                throw err;
            }
            fs.writeFile('./photos/' + val.toString() + counter + '.jpg', image.data, function (err) {
                if (err) {
                    throw err;
                }
                counter++;
                generateImage();
            });
        });
    }
}
generateImage();
