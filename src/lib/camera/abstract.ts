import {ICamera, ICameraOptions} from './interfaces';
import {DefaultWatcher} from '../watcher/default';
import {IWatcher} from '../watcher/interfaces';
import {defaultOptions} from './options/default';
import * as assign from 'object.assign';

export abstract class AbstractCamera implements ICamera {
    /**
     * Default camera options
     * @type {ICameraOptions}
     */
    public static readonly DEFAULT_OPTIONS: ICameraOptions = defaultOptions;

    public abstract takePhoto: (options?: ICameraOptions) => Promise<Buffer>;

    /**
     * Command for executing in child_process
     * @type {string}
     */
    protected readonly command: string = 'raspistill';

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

    // TODO move to some kind of configurable abstract class
    public setOptions = (options: ICameraOptions): void => {
        if (!options) {
            return;
        }

        Object.keys(defaultOptions).forEach((key: string) => {
            const value = options[key] || this.options[key];

            if (typeof value !== 'undefined') {
                this.options[key] = value;
            }
        });
    }

    public getOption = (key: string): any => {
        return this.options[key];
    }

    public getOptions = (): ICameraOptions => {
        return this.options;
    }

    /**
     * Returns ready-to-use in child_process methods array of options
     * @return {Array<string>}
     */
    protected processOptions = (newOptions?: ICameraOptions): Array<string> => {
        const currentOptions: ICameraOptions = assign({}, this.options, newOptions);
        const processedOptions = [];

        Object.keys(currentOptions).forEach((key) => {
            if (!this.optionsMap.hasOwnProperty(key)) {
                return;
            }

            if (currentOptions[key] === true) {
                processedOptions.push(this.optionsMap[key]);
            }

            if (typeof currentOptions[key] === 'string') {
                processedOptions.push(this.optionsMap[key]);
                processedOptions.push(currentOptions[key].toString());
            }
        });

        processedOptions.push('-o');
        processedOptions.push(
            currentOptions.outputDir + '/' + currentOptions.fileName + '.' + currentOptions.encoding
        );

        return processedOptions;
    }
}