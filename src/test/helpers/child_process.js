"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var imageGenerator = require("js-image-generator");
imageGenerator.generateImage(800, 600, 80, function (err, image) {
    if (err) {
        throw err;
    }
    fs.writeFileSync(__dirname + '/test_image.jpg', image.data);
    fs.createReadStream(__dirname + '/test_image.jpg').pipe(process.stdout);
});
