import {ICameraOptions} from '../interfaces';
export const defaultOptions: ICameraOptions = {
    noFileSave: false,
    verticalFlip: false,
    horizontalFlip: false,
    noPreview: true,
    outputDir: 'photos',
    fileName: undefined,
    encoding: 'jpg',
    width: undefined,
    height: undefined
};