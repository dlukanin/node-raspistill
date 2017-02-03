import {IWatcherOptions} from "./interfaces";
import defaultOptions from './options/default';

export abstract class AbstractWatcher {
    static readonly DEFAULT_OPTIONS: IWatcherOptions = defaultOptions;

    private options: IWatcherOptions;

    constructor(options?: IWatcherOptions) {
        this.options = {};
        Object.keys(options).forEach((key: string) => {
            this.options[key] = options[key];
        });
        this.setOptions(options);
    }

    // TODO move to some kind of configurable abstract class
    public setOptions = (options: IWatcherOptions): void => {
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

    public getOptions = (): IWatcherOptions => {
        return this.options;
    }
}