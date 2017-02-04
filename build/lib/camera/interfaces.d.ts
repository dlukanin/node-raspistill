/// <reference types="node" />
export declare type TCameraFileEncoding = 'jpg' | 'bpm' | 'gif' | 'png';
export interface ICameraOptions {
    verticalFlip?: boolean;
    horizontalFlip?: boolean;
    outputDir?: string;
    fileName?: string;
    encoding?: TCameraFileEncoding;
    width?: number;
    height?: number;
}
export interface ICamera {
    takePhoto(options?: ICameraOptions): Promise<Buffer>;
    setOptions(options: ICameraOptions): void;
    getOptions(): ICameraOptions;
    getOption(key: string): any;
}
