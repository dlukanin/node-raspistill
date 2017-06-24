import * as imageGenerator from 'js-image-generator';

let counter: number = 0;
function generateImage(): void {
    if (counter <= 4) {
        imageGenerator.generateImage(
            100 + Math.floor(Math.random() * 20),
            50,
            40,
            function(err: any, image: any): void {
                if (err) {
                    throw err;
                }
                process.stdout.write(image.data, () => {
                    counter++;
                    generateImage();
                });
            });
    }
}
generateImage();