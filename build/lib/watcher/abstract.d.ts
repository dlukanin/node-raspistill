import { IWatcherOptions } from './interfaces';
export declare abstract class AbstractWatcher {
    static readonly DEFAULT_OPTIONS: IWatcherOptions;
    private options;
    constructor(options?: IWatcherOptions);
    setOptions: (options: IWatcherOptions) => void;
    getOption: (key: string) => any;
    getOptions: () => IWatcherOptions;
}
