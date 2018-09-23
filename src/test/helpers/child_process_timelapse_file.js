"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var imageGenerator = require("js-image-generator");
var fs = require("fs");
var counter = 0;
function generateImage() {
    if (counter <= 4) {
        setTimeout(function () {
            imageGenerator.generateImage(100, 50, 40, function (err, image) {
                if (err) {
                    throw err;
                }
                fs.writeFileSync('./photos/' + Date.now().toString() + counter + '.jpg', image.data);
                counter++;
                generateImage();
            });
        }, 200);
    }
}
generateImage();
