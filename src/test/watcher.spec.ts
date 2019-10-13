import { DefaultWatcher } from '../lib/watcher/default';
import defaultOptions from '../lib/watcher/options/default';
import { IWatcherOptions } from '../lib/watcher/interfaces';
import * as rimraf from 'rimraf';
import * as rmfr from 'rmfr';
/* tslint:disable */
const fs = require('fs-promise');
/* tslint:enable */
const PHOTOS_DIR = './photos/';

import * as childProcess from 'child_process';
import { RaspistillInterruptError } from '../lib/error/interrupt';

// TODO refactor me

describe('watcher', function (): void {
    const FILE_NAME = '1.txt';
    const FILE_DATA = 'test';

    const watcher = new DefaultWatcher({ expireTime: 2000 });

    beforeEach(async () => {
        await rmfr(PHOTOS_DIR)
    });

    it.skip('should create dir if not exists', async (done: jest.DoneCallback) => {
        try {
            await fs.rmdir(PHOTOS_DIR)
            await watcher.watchAndGetFile(PHOTOS_DIR + FILE_NAME) // NOTE we don't need to test file watching in this case, so we ignore it.
            await fs.access(PHOTOS_DIR)
            done()
        } catch (e) {
            done(e)
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

    it('should ignore non WatcherOptions attrs', () => {
        const opts = { foo: 1 };
        const testWatcher = new DefaultWatcher(opts as any);
        expect(testWatcher.getOptions()).toStrictEqual(defaultOptions);
    });

    it('should return buffer object', async (done: jest.DoneCallback) => {
        const file = await watcher.watchAndGetFile(PHOTOS_DIR + FILE_NAME)
        expect(file).toBeInstanceOf(Buffer);
        expect(file.toString()).toBe('test');
        await fs.writeFile(PHOTOS_DIR + FILE_NAME, FILE_DATA);
        done()
    });

    it('should return error if no file exists after timeout', (done: jest.DoneCallback) => {
        watcher.watchAndGetFile(PHOTOS_DIR + '2.txt').catch((error) => {
            //  expect(error).to.eql(new Error('No taken photo found'));
            // TODO
            expect(error.message).toBe('No taken photo found');
            done();
        })
            .catch((err) => {
                done(err);
            });
    });

    // // TODO correct watcher watchAndGetFiles metod test

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
            process.stdout.write((++counter).toString(), 'files');
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