import * as imageGenerator from 'js-image-generator';
import * as fs from 'fs';

let counter = 0;

function generateImage(): void {
    counter++;
    if (counter <= 4) {
        const val = Math.floor(Math.random() * 20);
        imageGenerator.generateImage(
            800 + val,
            600,
            40,
            function(err: any, image: any): void {
                if (err) {
                    throw err;
                }

                fs.writeFile('./photos/' + val.toString() + counter, image.data, (err) => {
                    if (err) {
                        throw err;
                    }
                    generateImage();
                });
            });
    }
}

generateImage();