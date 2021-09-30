export type TCameraFileEncoding = 'jpg' | 'bmp' | 'gif' | 'png';

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
     * File encoding. jpg, bmp, gif or png
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

    quality?: number;
    thumb?: string;

    /**
     * Exposure mode
     */
    exposure?:
        | 'auto'
        | 'night'
        | 'nightpreview'
        | 'backlight'
        | 'spotlight'
        | 'sports'
        | 'snow'
        | 'beach'
        | 'verylong'
        | 'fixedfps'
        | 'antishake'
        | 'fireworks';

    /**
     * Flicker avoidance
     */
    flicker?: 'off' | 'auto' | '50hz' | '60hz';

    imageEffect?:
        | 'none'
        | 'negative'
        | 'solarise'
        | 'posterise'
        | 'whiteboard'
        | 'blackboard'
        | 'sketch'
        | 'denoise'
        | 'emboss'
        | 'oilpaint'
        | 'hatch'
        | 'gpen'
        | 'pastel'
        | 'watercolour'
        | 'film'
        | 'blur'
        | 'saturation';

    /**
     * dynamic range compression
     */
    drc?: 'off' | 'low' | 'med' | 'high';
}

export interface IInnerExecCameraOptions extends ICameraOptions {
    timelapse?: number;
    output?: string;
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
     * Gets current camera options.
     */
    getOptions(): ICameraOptions;
    /**
     * Gets current camera option.
     */
    getOption(key: string): any;
}
