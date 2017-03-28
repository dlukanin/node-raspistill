import {ICamera} from './interfaces';
import {AbstractCamera} from './abstract';

export class DefaultCamera extends AbstractCamera implements ICamera {
    public takePhoto(fileName?: string): Promise<Buffer> {
        let cameraFileName = this.getOption('fileName') || Date.now().toString();
        let cameraEncoding = this.getOption('encoding');

        if (this.getOption('noFileSave') === true) {
            return this.execRaspistill();
        }

        if (fileName && fileName.length) {
            const processedFileName = fileName.split('.');
            if (processedFileName.length > 1) {
                cameraFileName = processedFileName[0];
                cameraEncoding = processedFileName[1];
            } else {
                cameraFileName = fileName;
            }
        }

        return Promise.all([
            this.execRaspistill({
                fileName: cameraFileName,
                encoding: cameraEncoding
            }),
            this.watcher.watch(this.getOption('outputDir') + '/' + (cameraFileName + '.' + cameraEncoding))
        ])
            .then((result) => {
                if (result instanceof Array) {
                    return result[1];
                }

                return result;
            })
            .catch((error) => {
                // TODO Own error
                throw new Error((new Date()).toISOString() + ' Raspistill failed: ' + error.message);
            });
    }
}