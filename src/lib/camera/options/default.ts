import { ICameraOptions } from '../interfaces';
export const defaultOptions: ICameraOptions = {
    noFileSave: false,
    verticalFlip: false,
    horizontalFlip: false,
    rotation: 0,
    noPreview: true,
    outputDir: 'photos',
    fileName: undefined,
    encoding: 'jpg',
    width: undefined,
    height: undefined,
    time: undefined,
    iso: undefined,
    shutterspeed: undefined,
    contrast: undefined,
    brightness: undefined,
    saturation: undefined
};