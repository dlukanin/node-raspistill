import * as fs from 'fs';
import * as path from 'path';
import {AbstractWatcher} from './abstract';
import {IWatcher, IWatcherOptions} from './interfaces';
import {FSWatcher} from 'fs';
import Timer = NodeJS.Timer;

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

    private watcher: FSWatcher;
    private timer: Timer;

    constructor(options?: IWatcherOptions) {
        super(options);
    }

    public watchAndGetFile(filePath: string, options?: IWatcherOptions): Promise<Buffer> {
        const dirName = path.dirname(filePath);
        const fileName = path.basename(filePath);

        return new Promise((resolve: (result: any) => void, reject: (error: any) => void) => {
            try {
                fs.mkdirSync(dirName);
            } catch (err) {
                if (err.code !== EEXISTS) {
                    reject(err);
                }
            }

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

            const timer = setTimeout(() => {
                watcher.close();
                reject(new Error('No taken photo found'));
            }, this.getOption('expireTime'));

            this.watcher = watcher;
        });
    }

    public watchAndGetFiles(dirPath: string, watchTimeMs: number, cb: (file: Buffer) => any): Promise<void> {

        const dirName = path.basename(dirPath);

        return new Promise((resolve: (result?: any) => void, reject: (error: any) => void) => {
            try {
                fs.mkdirSync(dirName);
            } catch (err) {
                if (err.code !== EEXISTS) {
                    reject(err);
                }
            }

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

            const timer = setTimeout(() => {
                watcher.close();
                resolve();
            }, watchTimeMs);

            this.watcher = watcher;
            this.timer = timer;
        });
    }

    public closeWatcher(): void {
        if (this.watcher) {
            this.watcher.close();
            delete this.watcher;
        }

        if (this.timer) {
            clearTimeout(this.timer);
            delete this.timer;
        }
    }
}