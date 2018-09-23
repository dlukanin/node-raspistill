export type TCameraFileEncoding = 'jpg' | 'bpm' | 'gif' | 'png';

export interface ICameraOptions {
    /**
     * Keep saving photos on the drive or not.
     */
    noFileSave?: boolean;
    verticalFlip?: boolean;
    horizontalFlip?: boolean;
    rotation?: number;
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

    /**
     * Timeout in ms before an image is taken.
     */
    time?: number;

    /**
     * ISO sensitivity.
     */
    iso?: number;

    /**
     * Shutter speed in microseconds.
     */
    shutterspeed?: number;

    /**
     * Image correction settings.
     */
    contrast?: number;
    brightness?: number;
    saturation?: number;

    /**
     * White balance
     */
    awb?: string;
    awbg?: string;
}

export interface IInnerExecCameraOptions extends ICameraOptions {
    timelapse?: number;
}

/**
 * Interface for raspberry camera.
 */
export interface ICamera {
    /**
     * Executes command and returns taken photo.
     * @param {string} fileName
     */
    takePhoto(fileName?: string): Promise<Buffer>;
    /**
     * Executes command and returns taken photo.
     * @param {string} fileName
     * @param {number} intervalMs
     * @param {number} executionTimeMs
     * @param {Function} cb
     */
    timelapse(fileName: string, intervalMs: number, execTimeMs: number, cb: (image: Buffer) => any): Promise<void>;
    /**
     * Executes command and returns taken photo.
     * @param {number} intervalMs
     * @param {number} executionTimeMs
     * @param {Function} cb
     */
    timelapse(intervalMs: number, execTimeMs: number, cb: (image: Buffer) => any): Promise<void>;

    /**
     * Stops execution of current raspistill command.
     */
    stop(): void;
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