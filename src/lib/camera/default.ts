import {ICamera, TCameraFileEncoding} from './interfaces';
import {AbstractCamera} from './abstract';
import {execFile} from 'child_process';

export class DefaultCamera extends AbstractCamera implements ICamera {
    public takePhoto = (fileName?: string): Promise<Buffer> => {
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
            new Promise((resolve, reject) => {
                execFile(
                    this.command,
                    this.processOptions({
                        fileName: cameraFileName,
                        encoding: cameraEncoding
                    }),
                    (error: any, stdout: string, stderr: string) => {
                        if (error) {
                            reject(error);
                        }
                        resolve(stdout);
                    }
                );
            }),
            this.watcher.watch(this.getOption('outputDir') + (cameraFileName + '.' + cameraEncoding))
        ])
            .then((arr) => {
                return arr[1];
            })
            .catch((error) => {
                // TODO Own error
                throw new Error((new Date()).toISOString() + ' Raspistill failed: ' + error.message);
            });
    }
}