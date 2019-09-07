import {IWatcherOptions, IWatcher} from './interfaces';
import defaultOptions from './options/default';

export abstract class AbstractWatcher implements IWatcher {
    /**
     * Default watcher options.
     * @type {IWatcherOptions}
     */
    public static readonly DEFAULT_OPTIONS: IWatcherOptions = defaultOptions;

    /**
     * Current watcher options.
     * @type {IWatcherOptions}
     */
    private options: IWatcherOptions = {};

    constructor(options: IWatcherOptions = {}) {
        const opts = Object.assign({}, AbstractWatcher.DEFAULT_OPTIONS, options);
        this.setOptions(opts);
    }

    public abstract watchAndGetFile(filePath: string, options?: IWatcherOptions): Promise<Buffer>;

    public abstract watchAndGetFiles(dirPath: string, watchTimeMs: number, cb: (file: Buffer) => any): Promise<void>;

    public abstract closeWatcher(): void;

    public setOptions(options: IWatcherOptions): void {
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

    public getOption(key: string): any {
        return this.options[key];
    }

    public getOptions(): IWatcherOptions {
        return this.options;
    }
}