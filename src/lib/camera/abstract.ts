import {ICamera, ICameraOptions} from './interfaces';
import {DefaultWatcher} from '../watcher/default';
import {IWatcher} from '../watcher/interfaces';
import defaultOptions from './options/default';

export abstract class AbstractCamera implements ICamera {
    public static readonly DEFAULT_OPTIONS: ICameraOptions = defaultOptions;

    public abstract takePhoto: (options?: ICameraOptions) => Promise<Buffer>;

    protected watcher: IWatcher;
    protected options: ICameraOptions;

    constructor(options: ICameraOptions = {}, watcher: IWatcher = new DefaultWatcher()) {
        this.options = {};
        Object.keys(AbstractCamera.DEFAULT_OPTIONS).forEach((key: string) => {
            this.options[key] = options.hasOwnProperty(key) ? options[key] : AbstractCamera.DEFAULT_OPTIONS[key];
        });
        this.setOptions(options);
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
}