import * as imageGenerator from 'js-image-generator';
import * as fs from 'fs';

let counter: number = 0;
function generateImage(): void {
    if (counter <= 4) {
        setTimeout(() => {
            imageGenerator.generateImage(
                100,
                50,
                40,
                function(err: any, image: any): void {
                    if (err) {
                        throw err;
                    }

                    fs.writeFileSync('./photos/' + Date.now().toString() + counter + '.jpg', image.data);

                    counter++;
                    generateImage();
                }
            );
        }, 100);
    }
}

generateImage();
