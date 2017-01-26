import * as fs from 'fs';
import * as path from 'path';
import {AbstractWatcher} from "./abstract";
import {IWatcher, IWatcherOptions} from "./interfaces";

const EVENT_RENAME = 'rename';
const EVENT_CHANGE = 'change';
const ENOENT = 'ENOENT';
const EEXISTS = 'EEXIST';

/**
 * Default watcher class - wrapper around fs.watch.
 */
export class DefaultWatcher extends AbstractWatcher implements IWatcher {
    constructor(options?: IWatcherOptions) {
        super(options);
    }
    /**
     * Watcher file for changes and return file buffer on change.
     * @param filePath
     * @param expireTime
     * @return {Promise<Buffer | null>}
     */
    public watch = (filePath: string, options?: IWatcherOptions): Promise<Buffer> => {
        const dirName = path.dirname(filePath);
        const fileName = path.basename(filePath);

        return new Promise((resolve: Function, reject: Function) => {
            fs.mkdir(dirName, (err: any) => {
                if (err) {
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
                        })
                    }
                });

                setTimeout(() => {
                    watcher.close();
                    reject(new Error('No file found'));
                }, this.getOption('expireTime'));
            });
        });
    }
}