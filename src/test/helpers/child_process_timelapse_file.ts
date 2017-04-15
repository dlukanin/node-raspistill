import * as imageGenerator from 'js-image-generator';
import * as fs from 'fs';

let counter: number = 0;
function generateImage(): void {
    const val = Math.floor(Math.random() * 20);
    if (counter <= 4) {
        imageGenerator.generateImage(
            800 + val,
            600,
            40,
            function(err: any, image: any): void {
                if (err) {
                    throw err;
                }

                fs.writeFileSync('./photos/' + val.toString() + counter + '.jpg', image.data);
                counter++;
                generateImage();
            }
        );
    }
}

generateImage();
