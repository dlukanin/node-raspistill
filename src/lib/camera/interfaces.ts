export interface ICameraOptions {
    verticalFlip?: boolean;
    horizontalFlip?: boolean;
    /**
     * Default output directory.
     * E.g. '/photos/'
     */
    outputDir?: string;
    /**
     * Default file name.
     * E.g. test.jpg
     */
    fileName?: string;
}

/**
 * Interface for raspberry camera.
 */
export interface ICamera {
    /**
     * Executes command and returns taken photo.
     * @param {ICameraOptions} options
     */
    takePhoto(options?: ICameraOptions): Promise<Buffer>;
    /**
     * Sets new camera options.
     * @param options
     */
    setOptions(options: ICameraOptions): void;
    /**
     * Gets current camera options.
     */
    getOptions(): ICameraOptions;
    /**
     * Returns current camera option by key.
     * @param key
     */
    getOption(key: string): any;
}