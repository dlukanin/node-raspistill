import { ICamera, ICameraOptions, IInnerExecCameraOptions } from './interfaces';
import { defaultOptions } from './options/default';
import * as assign from 'object.assign';

export abstract class AbstractCamera implements ICamera {
    /**
     * Default camera options
     * @type {ICameraOptions}
     */
    public static readonly DEFAULT_OPTIONS: ICameraOptions = defaultOptions;

    /**
     * Camera options.
     * @type {ICameraOptions}
     */
    protected options: ICameraOptions = {};

    /**
     * Map "option and option value -> raspistil exec arg"
     * @type {any}
     */
    protected optionsMap: { [key: string]: string } = {
        verticalFlip: '-vf',
        horizontalFlip: '-hf',
        rotation: '-rot',
        noPreview: '-n',
        encoding: '-e',
        width: '-w',
        height: '-h',
        timelapse: '-tl',
        time: '-t',
        shutterspeed: '-ss',
        contrast: '-co',
        brightness: '-br',
        saturation: '-sa',
        iso: '-ISO',
        awb: '-awb',
        awbg: '-awbg'
    };

    constructor(options: ICameraOptions = {}) {
        const opts = assign({}, AbstractCamera.DEFAULT_OPTIONS, options);
        this.setOptions(opts);
    }

    public abstract takePhoto(fileName?: string): Promise<Buffer>;

    public abstract timelapse(
        fileName: string,
        intervalMs: number,
        execTimeMs: number,
        cb: (image: Buffer) => any
    ): Promise<void>;

    public abstract timelapse(
        intervalMs: number,
        execTimeMs: number,
        cb: (image: Buffer) => any
    ): Promise<void>;

    public abstract stop(): void;

    public setOptions(options: ICameraOptions): void {
        if (!options) {
            return;
        }

        Object.keys(defaultOptions).forEach((key: string) => {
            const value = typeof options[key] !== 'undefined' ?  options[key] : this.options[key];

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
    protected processOptions(newOptions?: IInnerExecCameraOptions): string[] {
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
}