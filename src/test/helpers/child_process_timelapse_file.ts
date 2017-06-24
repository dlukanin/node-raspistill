import * as imageGenerator from 'js-image-generator';
import * as fs from 'fs';

let counter: number = 0;
function generateImage(): void {
    const val = Math.floor(Math.random() * 20);
    if (counter <= 4) {
        imageGenerator.generateImage(
            100 + val,
            50,
            40,
            function(err: any, image: any): void {
                if (err) {
                    throw err;
                }

                fs.writeFile('./photos/' + val.toString() + counter + '.jpg', image.data, (err) => {
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
