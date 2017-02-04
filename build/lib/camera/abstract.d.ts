/// <reference types="node" />
import { ICamera, ICameraOptions } from './interfaces';
import { IWatcher } from '../watcher/interfaces';
export declare abstract class AbstractCamera implements ICamera {
    static readonly DEFAULT_OPTIONS: ICameraOptions;
    abstract takePhoto: (options?: ICameraOptions) => Promise<Buffer>;
    protected readonly command: string;
    protected watcher: IWatcher;
    protected options: ICameraOptions;
    protected optionsMap: any;
    constructor(options?: ICameraOptions, watcher?: IWatcher);
    setOptions: (options: ICameraOptions) => void;
    getOption: (key: string) => any;
    getOptions: () => ICameraOptions;
    protected processOptions: (newOptions?: ICameraOptions) => string[];
}
