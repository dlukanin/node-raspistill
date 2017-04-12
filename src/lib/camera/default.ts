import {ICamera, ICameraOptions} from './interfaces';
import {AbstractCamera} from './abstract';
import {IWatcher} from '../watcher/interfaces';
import {DefaultWatcher} from '../watcher/default';
import {IRaspistillExecutor} from '../executor/interfaces';
import {DefaultRaspistillExecutor} from '../executor/default';

export class DefaultCamera extends AbstractCamera implements ICamera {
    constructor(
        options: ICameraOptions = {},
        protected watcher: IWatcher = new DefaultWatcher(),
        protected executor: IRaspistillExecutor = new DefaultRaspistillExecutor()
    ) {
        super(options);
    }

    public timelapse(
        fileName: string, intervalMs: number, execTimeMs: number, cb: (image: Buffer) => any
    ): Promise<void>;
    public timelapse(
        intervalMs: number, execTimeMs: number, cb: (image: Buffer) => any
    ): Promise<void>;
    public timelapse(...args: any[]): Promise<void> {
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

        return this.executor.spawnAndGetImages(this.processOptions({
            time: execTimeMs,
            timelapse: intervalMs,
            fileName
        }), cb);
    }

    public takePhoto(fileName?: string): Promise<Buffer> {
        if (this.getOption('noFileSave') === true) {
            return this.executor.spawnAndGetImage(this.processOptions());
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
            this.executor.exec(this.processOptions({
                fileName: cameraFileName,
                encoding: cameraEncoding
            })),
            this.watcher.watch(this.getOption('outputDir') + '/' + (cameraFileName + '.' + cameraEncoding))
        ])
            .then((result) => {
                if (result instanceof Array) {
                    return result[1];
                }

                return result;
            })
            .catch((error) => {
                throw new Error((new Date()).toISOString() + ' Raspistill failed: ' + error.message);
            });
    }
}