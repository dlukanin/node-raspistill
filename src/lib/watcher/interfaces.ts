export interface IWatcherOptions {
    /**
     * Time in ms. Watcher watches file for expireTime ms.
     */
    expireTime?: number;
}

/**
 * Interface for file system _watcher - helper for camera.
 */
export interface IWatcher {
    /**
     * Watches passed file path and returns file buffer if file appeared.
     * @param filePath
     */
    watchAndGetFile(filePath: string): Promise<Buffer | null>;

    /**
     * Watches dir file path calls callback on returned buffer.
     * @param dirPath
     * @param watchTimeMs
     */
    watchAndGetFiles(dirPath: string, watchTimeMs: number, cb: (file: Buffer) => any): Promise<void>;

    /**
     * Closes current running fs _watcher.
     */
    closeWatcher(): void;

    /**
     * Sets current _watcher options.
     * @param options
     */
    setOptions(options: IWatcherOptions): void;
    /**
     * Gets current _watcher options.
     */
    getOptions(): IWatcherOptions;
    /**
     * Gets current _watcher option by key.
     * @param key
     */
    getOption(key: string): any;
}
