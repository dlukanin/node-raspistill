import * as fs from 'fs';
import * as imageGenerator from 'js-image-generator';

imageGenerator.generateImage(800, 600, 80, function(err, image) {
    if (err) {
        throw err;
    }
    fs.writeFileSync(__dirname + '/test_image.jpg', image.data);
    fs.createReadStream(__dirname + '/test_image.jpg').pipe(process.stdout);
});


