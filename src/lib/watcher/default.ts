import * as fs from 'fs';
import * as path from 'path';
import {AbstractWatcher} from './abstract';
import {IWatcher, IWatcherOptions} from './interfaces';
import {FSWatcher} from 'fs';
import Timer = NodeJS.Timer;

// TODO move into watcher class (?)
const EVENT_RENAME = 'rename';
const EVENT_CHANGE = 'change';
const ENOENT = 'ENOENT';
const EEXISTS = 'EEXIST';

/**
 * Default watcher class - wrapper around fs.watch.
 */
export class DefaultWatcher extends AbstractWatcher implements IWatcher {
    /**
     * Default symbol, used by current raspistill app to mark temp photo file.
     * @type {string}
     */
    public static readonly IMAGE_IN_PROGRESS_SYMBOL: string = '~';

    /**
     * Event code for manual closing watch action.
     * @type {string}
     */
    public static readonly FORCE_CLOSE_EVENT: string = 'forceClose';

    /**
     * Error message - no file found after timeout
     * @type {string}
     */
    public static readonly ERROR_NO_PHOTO: string = 'No taken photo found';

    /**
     * Error message - action was force closed by user.
     * @type {string}
     */
    public static readonly ERROR_FORCE_CLOSED: string = 'Action was force-closed';

    private watcher: FSWatcher;

    constructor(options?: IWatcherOptions) {
        super(options);
    }

    public watchAndGetFile(filePath: string, options?: IWatcherOptions): Promise<Buffer> {
        const dirName = path.dirname(filePath);
        const fileName = path.basename(filePath);

        return new Promise<Buffer>((resolve, reject) => {
            this.makeDir(dirName);
            const watcher = fs.watch(dirName, (eventType: string, changedFileName: string) => {
                if ((eventType === EVENT_RENAME || eventType === EVENT_CHANGE) && fileName === changedFileName) {
                    watcher.close();

                    fs.readFile(filePath, (err: any, data: Buffer) => {
                        if (err) {
                            if (err.code === ENOENT) {
                                resolve(null);
                            }
                            reject(err);
                        }

                        resolve(data);
                    });
                }
            });

            this.addForceCloseHandler(watcher, setTimeout(() => {
                watcher.close();
                reject(new Error(DefaultWatcher.ERROR_NO_PHOTO));
            }, this.getOption('expireTime')), reject);

            this.watcher = watcher;
        });
    }

    public watchAndGetFiles(dirPath: string, watchTimeMs: number, cb: (file: Buffer) => any): Promise<void> {
        const dirName = path.basename(dirPath);

        return new Promise<void>((resolve, reject) => {
            this.makeDir(dirName);
            const watcher = fs.watch(dirName, (eventType: string, changedFileName: string) => {
                if (
                    changedFileName[changedFileName.length - 1] === DefaultWatcher.IMAGE_IN_PROGRESS_SYMBOL
                ) {
                    return;
                }

                if (
                    (eventType === EVENT_RENAME)
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

            this.watcher = watcher;
        });
    }

    public closeWatcher(): void {
        if (this.watcher) {
            this.watcher.emit(DefaultWatcher.FORCE_CLOSE_EVENT);
        }
    }

    private makeDir(dirName: string): void {
        try {
            fs.mkdirSync(dirName);
        } catch (err) {
            if (err.code !== EEXISTS) {
                throw err;
            }
        }
    }

    private addForceCloseHandler(watcher: FSWatcher, timer: Timer, reject: (err: any) => void): void {
        watcher.on(DefaultWatcher.FORCE_CLOSE_EVENT, () => {
            watcher.close();
            clearTimeout(timer);
            reject(new Error(DefaultWatcher.ERROR_FORCE_CLOSED));
        });
    }
}