import * as fs from 'fs';
import * as path from 'path';
import { IWatcher, IWatcherOptions } from './interfaces';
import { FSWatcher } from 'fs';
import Timer = NodeJS.Timer;
import { RaspistillInterruptError } from '../error/interrupt';
import { RaspistillDefaultError } from '../..';

/**
 * Default _watcher class - wrapper around fs.watch.
 */
export class DefaultWatcher implements IWatcher {
    protected _options: IWatcherOptions = {};

    /**
     * Default symbol, used by current raspistill app to mark temp photo file.
     * @type {string}
     */
    private readonly _imageInProgressSymbol: string = '~';

    /**
     * Event code for manual closing watch action.
     * @type {string}
     */
    private readonly _forceCloseEvent: string = 'forceClose';

    private readonly _defaultOptions: IWatcherOptions = {
        expireTime: 20000
    };

    private _watcher: FSWatcher;

    private _messages: Record<'EVENT_RENAME' | 'EVENT_CHANGE' | 'ENOENT' | 'EEXISTS', string> = {
        EVENT_RENAME: 'rename',
        EVENT_CHANGE: 'change',
        ENOENT: 'ENOENT',
        EEXISTS: 'EEXIST'
    };

    constructor(options?: IWatcherOptions) {
        this.setOptions(Object.assign({}, this._defaultOptions, options));
    }

    public setOptions(options: IWatcherOptions): void {
        Object.assign(this._options, options);
    }

    public getOption(key: string): any {
        return this._options[key];
    }

    public getOptions(): IWatcherOptions {
        return this._options;
    }

    public async watchAndGetFile(filePath: string, options?: IWatcherOptions): Promise<Buffer> {
        const dirName = path.dirname(filePath);
        const fileName = path.basename(filePath);

        this._makeDir(dirName);

        return await new Promise<Buffer>((resolve, reject) => {
            let timeout: Timer;

            const watcher = fs.watch(dirName, (eventType: string, changedFileName: string) => {
                if (
                    (eventType === this._messages.EVENT_RENAME || eventType === this._messages.EVENT_CHANGE) &&
                    fileName === changedFileName
                ) {
                    clearTimeout(timeout);
                    watcher.close();

                    fs.readFile(filePath, (err: any, data: Buffer) => {
                        if (err) {
                            if (err.code === this._messages.ENOENT) {
                                resolve(null);
                            }
                            reject(err);
                        }

                        resolve(data);
                    });
                }
            });

            timeout = setTimeout(() => {
                watcher.close();
                reject(new RaspistillDefaultError(RaspistillDefaultError.CODE_NO_PHOTO));
            }, this.getOption('expireTime'));

            this.addForceCloseHandler(watcher, timeout, reject);

            this._watcher = watcher;
        });
    }

    public async watchAndGetFiles(dirPath: string, watchTimeMs: number, cb: (file: Buffer) => any): Promise<void> {
        const dirName = path.basename(dirPath);

        this._makeDir(dirName);

        return await new Promise<void>((resolve, reject) => {
            const watcher = fs.watch(dirName, (eventType: string, changedFileName: string) => {
                if (
                    changedFileName[changedFileName.length - 1] === this._imageInProgressSymbol
                ) {
                    return;
                }

                if (
                    (eventType === this._messages.EVENT_RENAME)
                ) {
                    fs.readFile(dirName + '/' + changedFileName, (err: any, data: Buffer) => {
                        if (err) {
                            reject(err);
                        } else {
                            cb(data);
                        }
                    });
                }
            });

            this.addForceCloseHandler(watcher, setTimeout(() => {
                watcher.close();
                resolve();
            }, watchTimeMs), reject);

            this._watcher = watcher;
        });
    }

    public closeWatcher(): void {
        if (this._watcher) {
            this._watcher.emit(this._forceCloseEvent);
        }
    }

    private _makeDir(dirName: string): void {
        // TODO think about async - now async conflicts with stop method
        try {
            fs.mkdirSync(dirName, {recursive: true});
        } catch (err) {
            if (err.code !== this._messages.EEXISTS) {
                throw err;
            }
        }
    }

    private addForceCloseHandler(watcher: FSWatcher, timer: Timer, reject: (err: any) => void): void {
        watcher.on(this._forceCloseEvent, () => {
            clearTimeout(timer);
            watcher.close();
            reject(new RaspistillInterruptError());
        });
    }
}