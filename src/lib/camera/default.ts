import {ICamera, ICameraOptions} from './interfaces';
import {AbstractCamera} from './abstract';
import {IWatcher} from '../..';
import {DefaultWatcher} from '../watcher/default';
import {IRaspistillExecutor} from '../..';
import {DefaultRaspistillExecutor} from '../executor/default';
import {RaspistillInterruptError} from '../..';
import {RaspistillDefaultError} from '../..';

export class DefaultCamera extends AbstractCamera implements ICamera {
    constructor(options: ICameraOptions = {},
                protected watcher: IWatcher = new DefaultWatcher(),
                protected executor: IRaspistillExecutor = new DefaultRaspistillExecutor()) {
        super(options);
    }

    public timelapse(
        fileName: string, intervalMs: number, execTimeMs: number, cb: (image: Buffer) => any
    ): Promise<void>;
    public timelapse(intervalMs: number, execTimeMs: number, cb: (image: Buffer) => any): Promise<void>;
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

        if (this.getOption('noFileSave')) {
            return this.executor.spawnAndGetImages(this.processOptions({
                time: execTimeMs,
                timelapse: intervalMs,
                fileName
            }), cb)
                .catch(this.processError);
        }

        let cameraFileName = this.getOption('fileName') || Date.now().toString() + '%04d';
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
                encoding: cameraEncoding,
                time: execTimeMs,
                timelapse: intervalMs
            })),
            this.watcher.watchAndGetFiles(this.getOption('outputDir'), execTimeMs, cb)
        ])
            .then(() => { return; })
            .catch(this.processError);
    }

    public takePhoto(fileName?: string): Promise<Buffer> {
        if (this.getOption('noFileSave') === true) {
            return this.executor.spawnAndGetImage(this.processOptions())
                .catch(this.processError);
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
            this.watcher.watchAndGetFile(this.getOption('outputDir') + '/' + (cameraFileName + '.' + cameraEncoding))
        ])
            .then((result) => {
                if (result instanceof Array) {
                    return result[1];
                }

                return result;
            })
            .catch(this.processError);
    }

    public stop(): void {
        this.watcher.closeWatcher();
        this.executor.killProcess();
    }

    private processError(error: Error): never {
        // TODO
        if (error instanceof RaspistillInterruptError) {
            throw error;
        }
        throw new RaspistillDefaultError(error.message);
    }
}
