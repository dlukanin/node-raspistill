import * as imageGenerator from 'js-image-generator';
import * as fs from 'fs';

let counter = 0;

function generateImage(): void {
    setTimeout(() => {
        const val = Math.floor(Math.random() * 20);
        imageGenerator.generateImage(
            800 + val,
            600,
            40,
            function(err: any, image: any): void {
                counter++;
                if (counter <= 4) {
                    fs.writeFile('./photos/' + val.toString() + counter, image.data, (err) => {
                        if (err) {
                            throw err;
                        }
                    });
                    generateImage();
                }
                if (err) {
                    throw err;
                }
            });
    }, 300);
}

generateImage();