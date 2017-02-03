export interface IWatcherOptions {
    /**
     * Time in ms. Watcher watches file for expireTime ms.
     */
    expireTime?: number;
}

/**
 * Interface for file system watcher - helper for camera.
 */
export interface IWatcher {
    /**
     * Watches passed file path and returns file buffer if file appeared.
     * @param filePath
     */
    watch(filePath: string): Promise<Buffer | null>;
    /**
     * Sets current watcher options.
     * @param options
     */
    setOptions(options: IWatcherOptions): void;
    /**
     * Gets current watcher options.
     */
    getOptions(): IWatcherOptions;
    /**
     * Gets current watcher option by key.
     * @param key
     */
    getOption(key: string): any;
}