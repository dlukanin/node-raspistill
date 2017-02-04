/// <reference types="node" />
import { AbstractWatcher } from './abstract';
import { IWatcher, IWatcherOptions } from './interfaces';
export declare class DefaultWatcher extends AbstractWatcher implements IWatcher {
    constructor(options?: IWatcherOptions);
    watch: (filePath: string, options?: IWatcherOptions) => Promise<Buffer>;
}
