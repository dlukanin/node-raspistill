import {ICamera, ICameraOptions} from './interfaces';
import {DefaultWatcher} from '../watcher/default';
import {IWatcher} from '../watcher/interfaces';
import {defaultOptions} from './options/default';
import * as assign from 'object.assign';
import {execFile, spawn} from 'child_process';

export abstract class AbstractCamera implements ICamera {
    /**
     * Default camera options
     * @type {ICameraOptions}
     */
    public static readonly DEFAULT_OPTIONS: ICameraOptions = defaultOptions;

    /**
     * Command for executing in child_process
     * @type {string}
     */
    protected readonly command: string = 'raspistill';

    /**
     * Max buffer size when using execFile raspistill command.
     * @type {number}
     */
    protected maxBuffer: number = 400 * 1024;

    /**
     * Watcher object for current camera.
     * @type {IWatcher}
     */
    protected watcher: IWatcher;

    /**
     * Camera options.
     * @type {ICameraOptions}
     */
    protected options: ICameraOptions = {};

    /**
     * Map "option and option value -> raspistil exec arg"
     * @type {any}
     */
    protected optionsMap: {[key: string]: string} = {
        verticalFlip: '-vf',
        horizontalFlip: '-hf',
        noPreview: '-n',
        encoding: '-e',
        width: '-w',
        height: '-h'
    };

    constructor(options: ICameraOptions = {}, watcher: IWatcher = new DefaultWatcher()) {
        const opts = assign({}, AbstractCamera.DEFAULT_OPTIONS, options);
        this.setOptions(opts);
        this.watcher = watcher;
    }

    public abstract takePhoto(fileName?: string): Promise<Buffer>;

    // TODO move to some kind of configurable abstract class
    public setOptions(options: ICameraOptions): void {
        if (!options) {
            return;
        }

        Object.keys(defaultOptions).forEach((key: string) => {
            const value = options[key] || this.options[key];

            if (typeof value !== 'undefined') {
                this.options[key] = value;
            }

            if (
                typeof defaultOptions[key] === 'undefined' &&
                options.hasOwnProperty(key) && typeof options[key] === 'undefined'
            ) {
                this.options[key] = undefined;
            }
        });

        this.options.width = this.options.width || this.options.height;
        this.options.height = this.options.height || this.options.width;

        if (this.options.width) {
            this.options.width = Math.round(this.options.width);
        }

        if (this.options.height) {
            this.options.height = Math.round(this.options.height);
        }
    }

    public setDefaultOptions(): void {
        this.options = defaultOptions;
    }

    public getOption(key: string): any {
        return this.options[key];
    }

    public getOptions(): ICameraOptions {
        return this.options;
    }

    /**
     * Returns ready-to-use in child_process methods array of options
     * @return {Array<string>}
     */
    protected processOptions(newOptions?: ICameraOptions): string[] {
        const currentOptions: ICameraOptions = assign({}, this.options, newOptions);
        const processedOptions = [];

        Object.keys(currentOptions).forEach((key) => {
            if (!this.optionsMap.hasOwnProperty(key)) {
                return;
            }

            if (currentOptions[key] === true) {
                processedOptions.push(this.optionsMap[key]);
            }

            if (typeof currentOptions[key] === 'string' || typeof currentOptions[key] === 'number') {
                processedOptions.push(this.optionsMap[key]);
                processedOptions.push(currentOptions[key].toString());
            }
        });

        processedOptions.push('-o');
        processedOptions.push(
            this.getOption('noFileSave') === true ? '-' :
                (currentOptions.outputDir + '/' + currentOptions.fileName + '.' + currentOptions.encoding)
        );

        return processedOptions;
    }

    /**
     * Executes raspistill command.
     * @param newCameraOptions
     * @return {Promise<Buffer>}
     */
    protected execRaspistill(newCameraOptions: ICameraOptions = {}): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            execFile(
                this.command,
                this.processOptions(newCameraOptions),
                {
                    maxBuffer: this.maxBuffer,
                    encoding: 'binary'
                },
                (error: any, stdout, stderr) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(stdout);
                }
            );
        });
    }

    /**
     * Spawns raspistill process and returns buffer from stdout.
     * @param newCameraOptions
     * @return {Promise<Buffer>}
     */
    protected spawnRaspistill(newCameraOptions: ICameraOptions = {}): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            let photoBuffer: Buffer = new Buffer(0);
            let errorBuffer: Buffer = new Buffer(0);
            let error: any;

            const childProcess = spawn(
                this.command,
                this.processOptions(newCameraOptions)
            );

            childProcess.on('error', (processError: any) => {
                error = processError;
            });

            childProcess.on('close', () => {
                childProcess.kill();

                if (error) {
                    reject(error);
                }

                if (errorBuffer.toString().length) {
                    reject(new Error(errorBuffer.toString()));
                }

                resolve(photoBuffer);
            });

            childProcess.stdout.on('data', (data: Buffer) => {
                photoBuffer = Buffer.concat([photoBuffer, data]);
            });

            childProcess.stderr.on('data', (data: Buffer) => {
                errorBuffer = Buffer.concat([errorBuffer, data]);
            });
        });
    }
}