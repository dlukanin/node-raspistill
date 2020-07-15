import { DefaultWatcher } from '../src/lib/watcher/default';
import { IWatcherOptions } from '../src/lib/watcher/interfaces';

/* tslint:disable */
const fs = require('mz/fs');
/* tslint:enable */
const PHOTOS_DIR = './_watcher/';

import * as childProcess from 'child_process';
import { RaspistillInterruptError } from '../src/lib/error/interrupt';
import * as util from 'util';
import * as rimraf from 'rimraf';

const rmrf = util.promisify(rimraf);

// TODO refactor me

describe('watcher', function(): void {
    const FILE_NAME = '1.txt';
    const FILE_DATA = 'test';

    const watcher = new DefaultWatcher({ expireTime: 2000 });

    beforeEach(async () => {
        await rmrf(PHOTOS_DIR);
    });

    afterEach(async () => {
        await rmrf(PHOTOS_DIR);
    });

    it('should create dir if not exists', async (done: jest.DoneCallback) => {
        try {
            watcher.watchAndGetFile(
                PHOTOS_DIR + FILE_NAME
            ).catch((err) => {
                // NOTE we don't need to test file watching in this case, so we ignore it.
            });
            await fs.access(PHOTOS_DIR);
            done();
        } catch (e) {
            done(e);
        }
    });

    it('should init/set options', (done: jest.DoneCallback) => {
        const options: IWatcherOptions = { expireTime: 2000 };

        const testWatcher = new DefaultWatcher(options);

        expect(testWatcher.getOptions()).toStrictEqual(options);

        options.expireTime = 2600;
        expect(testWatcher.getOptions()).not.toStrictEqual(options);

        testWatcher.setOptions(options);
        expect(testWatcher.getOptions()).toStrictEqual(options);

        done();
    });

    it('should return buffer object', async (done: jest.DoneCallback) => {
        watcher.watchAndGetFile(PHOTOS_DIR + FILE_NAME).then((file) => {
            expect(file).toBeInstanceOf(Buffer);
            expect(file.toString()).toBe('test');
            done();
        });

        await fs.writeFile(PHOTOS_DIR + FILE_NAME, FILE_DATA);
    });

    it('should return error if no file exists after timeout', (done: jest.DoneCallback) => {
        watcher.watchAndGetFile(PHOTOS_DIR + '2.txt').catch((error) => {
            expect(error.message).toBe('Raspistill failed, code: NO_TAKEN_PHOTO_FOUND message: undefined');
            done();
        })
            .catch((err) => {
                done(err);
            });
    });

    // // TODO correct _watcher watchAndGetFiles method test

    it('should close watcher process (watchAndGetFile method)', (done: jest.DoneCallback) => {
        const watcherPromise = watcher.watchAndGetFile(PHOTOS_DIR + '3.txt').then((file) => {
            done('Watcher should not trigger');
        });

        const fsPromise = fs.writeFile(PHOTOS_DIR + '3.txt', FILE_DATA);

        watcher.closeWatcher();

        Promise.all([watcherPromise, fsPromise])
            .then(() => {
                done('Promise should not resolve');
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(RaspistillInterruptError);
                done();
            });
    });

    it('should close watcher process (watchAndGetFiles method)', (done: jest.DoneCallback) => {
        let counter = 0;
        watcher.watchAndGetFiles(PHOTOS_DIR, 3500, (file) => {
            counter++;
        })
            .then(() => {
                done('Promise should not resolve');
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(RaspistillInterruptError);
                done();
            });

        childProcess.spawn('node', [__dirname + '/helpers/child_process_timelapse_file.js']);
        watcher.closeWatcher();
    });
});