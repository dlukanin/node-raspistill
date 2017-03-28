export type TCameraFileEncoding = 'jpg' | 'bpm' | 'gif' | 'png';

export interface ICameraOptions {
    /**
     * Keep saving photos on the drive or not.
     */
    noFileSave?: boolean;
    verticalFlip?: boolean;
    horizontalFlip?: boolean;
    noPreview?: boolean;
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
    /**
     * File encoding. jpg, bpm, gif or png
     */
    encoding?: TCameraFileEncoding;
    width?: number;
    height?: number;
}

/**
 * Interface for raspberry camera.
 */
export interface ICamera {
    /**
     * Executes command and returns taken photo.
     * @param {fileName: string} options
     */
    takePhoto(fileName?: string): Promise<Buffer>;
    /**
     * Sets new camera options.
     * @param options
     */
    setOptions(options: ICameraOptions): void;
    /**
     * Sets camera options to default.
     */
    setDefaultOptions(): void;
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