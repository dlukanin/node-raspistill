export interface IWatcherOptions {
    expireTime?: number;
    recursive?: boolean;
}

export interface IWatcher {
    watch(filePath: string): Promise<Buffer | null>;
    setOptions(options: IWatcherOptions): void;
    getOptions(): IWatcherOptions;
    getOption(key: string): any;
}