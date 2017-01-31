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

export interface ICamera {
    takePhoto(options?: ICameraOptions): Promise<Buffer>;
    setOptions(options: ICameraOptions): void;
    getOptions(): ICameraOptions;
    getOption(key: string): any;
}