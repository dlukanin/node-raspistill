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
    watchAndGetFile(filePath: string): Promise<Buffer | null>;

    /**
     * Watches dir file path calls callback on returned buffer.
     * @param dirPath
     * @param watchTimeMs
     */
    watchAndGetFiles(dirPath: string, watchTimeMs: number, cb: (file: Buffer) => any): Promise<void>;

    /**
     * Closes current running fs watcher.
     */
    closeWatcher(): void;

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