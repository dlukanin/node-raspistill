import {ICamera} from './interfaces';
import {AbstractCamera} from './abstract';

export class DefaultCamera extends AbstractCamera implements ICamera {
    public timelapse(
        ...args: any[]
    ): Promise<void> {
        let fileName: string;
        let intervalMs: number;
        let execTimeMs: number;
        let cb: (image: Buffer) => any;

        if (typeof args[0] === 'string') {
            fileName = args[0];
            intervalMs = args[1];
            execTimeMs = args[2];
            cb = args[3];
        } else {
            intervalMs = args[0];
            execTimeMs = args[1];
            cb = args[2];
        }

        return this.spawnRaspistillForTimelapse(cb, {fileName});
    }

    public takePhoto(fileName?: string): Promise<Buffer> {
        if (this.getOption('noFileSave') === true) {
            return this.spawnRaspistill();
        }

        let cameraFileName = this.getOption('fileName') || Date.now().toString();
        let cameraEncoding = this.getOption('encoding');

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