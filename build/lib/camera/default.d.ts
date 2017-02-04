/// <reference types="node" />
import { ICamera } from './interfaces';
import { AbstractCamera } from './abstract';
export declare class DefaultCamera extends AbstractCamera implements ICamera {
    takePhoto: (fileName?: string) => Promise<Buffer>;
}
