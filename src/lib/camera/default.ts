import { ICamera, ICameraOptions, IInnerExecCameraOptions, TCameraFileEncoding } from './interfaces';
import { IWatcher } from '../..';
import { DefaultWatcher } from '../watcher/default';
import { IRaspistillExecutor } from '../..';
import { DefaultRaspistillExecutor } from '../executor/default';
import { RaspistillInterruptError } from '../..';
import { RaspistillDefaultError } from '../..';
import { ClaMapper, IClaMapper } from 'cla-mapper';

export class DefaultCamera implements ICamera {
    /**
     * Default camera options
     * @type {ICameraOptions}
     */
    public readonly defaultOptions: ICameraOptions = {
        noFileSave: false,
        verticalFlip: false,
        horizontalFlip: false,
        noPreview: true,
        outputDir: 'photos',
        encoding: 'jpg'
    };

    protected _options: ICameraOptions = {};

    /**
     * Map "option and option value -> raspistil exec arg"
     * @type {any}
     */
    protected readonly _optionsMap: Record<string, string> = {
        verticalFlip: '-vf',
        horizontalFlip: '-hf',
        noPreview: '-n',
        encoding: '-e',
        width: '-w',
        height: '-h',
        time: '-t',
        iso: '-ISO',
        shutterspeed: '-ss',
        contrast: '-co',
        timelapse: '-tl',
        brightness: '-br',
        saturation: '-sa',
        awb: '-awb',
        awbg: '-awbg',
        quality: '-q',
        thumb: '-th',
        rotation: '-rot',
        output: '-o'
    };

    // tslint:disable-next-line:variable-name
    protected _optionsParser: IClaMapper;

    constructor(
        protected options: ICameraOptions = {},
        protected watcher: IWatcher = new DefaultWatcher(),
        protected executor: IRaspistillExecutor = new DefaultRaspistillExecutor()
    ) {
        this._optionsParser = new ClaMapper(this._optionsMap);
        this.setOptions(Object.assign({}, this.defaultOptions, options));
    }

    public setOptions(options: ICameraOptions): void {
        Object.assign(this._options, options);
    }

    public getOptions(): ICameraOptions {
        return this._options;
    }

    public getOption(key: string): any {
        return this._options[key];
    }

    public async timelapse(
        fileName: string, intervalMs: number, execTimeMs: number, cb: (image: Buffer) => any
    ): Promise<void>;
    public async timelapse(intervalMs: number, execTimeMs: number, cb: (image: Buffer) => any): Promise<void>;
    public async timelapse(...args: any[]): Promise<void> {
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

        if (this._options.noFileSave) {
            try {
                return await this.executor.spawnAndGetImages(this._processOptions({
                    time: execTimeMs,
                    timelapse: intervalMs,
                    fileName
                }), cb);
            } catch (err) {
                this._processError(err);
            }
        }

        let cameraFileName = this._options.fileName || Date.now().toString() + '%04d';
        let cameraEncoding = this._options.encoding;

        if (fileName && fileName.length) {
            const processedFileName = fileName.split('.');
            if (processedFileName.length > 1) {
                cameraFileName = processedFileName[0];
                cameraEncoding = processedFileName[1] as TCameraFileEncoding;
            } else {
                cameraFileName = fileName;
            }
        }

        try {
            await Promise.all([
                this.executor.exec(this._processOptions({
                    fileName: cameraFileName,
                    encoding: cameraEncoding,
                    time: execTimeMs,
                    timelapse: intervalMs
                })),
                this.watcher.watchAndGetFiles(this.options.outputDir, execTimeMs, cb)
            ]);
        } catch (err) {
            this._processError(err);
        }
    }

    public async takePhoto(fileName?: string): Promise<Buffer> {
        if (this._options.noFileSave === true) {
            try {
                return await this.executor.spawnAndGetImage(this._processOptions());
            } catch (err) {
                this._processError(err);
            }
        }

        let cameraFileName = this._options.fileName || Date.now().toString();
        let cameraEncoding = this._options.encoding;

        if (fileName && fileName.length) {
            const processedFileName = fileName.split('.');
            if (processedFileName.length > 1) {
                cameraFileName = processedFileName[0];
                cameraEncoding = processedFileName[1] as TCameraFileEncoding;
            } else {
                cameraFileName = fileName;
            }
        }

        try {
            const result = await Promise.all([
                this.executor.exec(this._processOptions({
                    fileName: cameraFileName,
                    encoding: cameraEncoding
                })),
                this.watcher.watchAndGetFile(this._options.outputDir + '/' + (cameraFileName + '.' + cameraEncoding))
            ]);

            if (result instanceof Array) {
                return result[1];
            }

            return result;
        } catch (err) {
            this._processError(err);
        }
    }

    public stop(): void {
        this.watcher.closeWatcher();
        this.executor.killProcess();
    }

    /**
     * Returns ready-to-use in child_process methods array of options
     * @return {Array<string>}
     */
    protected _processOptions(newOptions: IInnerExecCameraOptions = {}): string[] {
        const options = Object.assign({}, this._options, newOptions);

        options.output = options.noFileSave === true ? '-' :
            (options.outputDir + '/' + options.fileName + '.' + options.encoding);

        return this._optionsParser.getCommandLineArgs(options);
    }

    private _processError(error: Error): never {
        // TODO
        if (error instanceof RaspistillInterruptError) {
            throw error;
        }
        throw new RaspistillDefaultError(error.message);
    }
}
