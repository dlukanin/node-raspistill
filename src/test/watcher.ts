import {DefaultWatcher} from '../lib/watcher/default';
import defaultOptions from '../lib/watcher/options/default';
import {expect} from 'chai';
import {IWatcherOptions} from '../lib/watcher/interfaces';
import * as rimraf from 'rimraf';
/* tslint:disable */
const fs = require('fs-promise');
/* tslint:enable */
const PHOTOS_DIR = './photos/';

import * as childProcess from 'child_process';
import {RaspistillInterruptError} from '../lib/error/interrupt';

// TODO refactor me

describe('watcher', function(): void {
    const FILE_NAME = '1.txt';
    const FILE_DATA = 'test';

    this.timeout(5000);

    const watcher = new DefaultWatcher({expireTime: 2000});

    it('should create dir if not exists', function(done: MochaDone): void {
        fs.rmdir(PHOTOS_DIR)
            .catch((error) => {
                return;
            })
            .then(() => watcher.watchAndGetFile(PHOTOS_DIR + FILE_NAME))
            .catch((error) => {
                return; // NOTE we don't need to test file watching in this case, so we ignore it.
            })
            .then(() => fs.access(PHOTOS_DIR))
            .then(() => {
                done();
            })
            .catch((error) => {
                done(error);
            });
    });

    it('should init/set options', function(done: MochaDone): void {
        const options: IWatcherOptions = {expireTime: 2000};

        const testWatcher = new DefaultWatcher(options);

        expect(testWatcher.getOptions()).to.eql(options);

        options.expireTime = 2600;
        expect(testWatcher.getOptions()).not.to.eql(options);

        testWatcher.setOptions(options);
        expect(testWatcher.getOptions()).to.eql(options);

        done();
    });

    it('should ignore non WatcherOptions attrs', function(): void {
        const opts = {foo: 1};
        const testWatcher = new DefaultWatcher(opts as any);

        expect (testWatcher.getOptions()).to.eql(defaultOptions);

    });

    it('should return buffer object', function(done: MochaDone): void {
        const watcherPromise = watcher.watchAndGetFile(PHOTOS_DIR + FILE_NAME).then((file) => {
            expect(file).to.be.instanceof(Buffer);
            expect(file.toString()).to.eq('test');
        });

        const fsPromise = fs.writeFile(PHOTOS_DIR + FILE_NAME, FILE_DATA);

        Promise.all([watcherPromise, fsPromise])
            .then(() => {
                done();
            })
            .catch((error) => {
                done(error);
            });
    });

    it('should return error if no file exists after timeout', function(done: MochaDone): void {
        watcher.watchAndGetFile(PHOTOS_DIR + '2.txt').catch((error) => {
            //  expect(error).to.eql(new Error('No taken photo found'));
            // TODO
            expect(error.message).to.eq('No taken photo found');
            done();
        })
            .catch((err) => {
                done(err);
            });
    });

    // TODO correct watcher watchAndGetFiles metod test

    it('should close watcher process (watchAndGetFile method)', function(done: MochaDone): void {
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
                expect(error).to.be.instanceof(RaspistillInterruptError);
                done();
            });
    });

    it('should close watcher process (watchAndGetFiles method)', function(done: MochaDone): void {
        let counter = 0;
        watcher.watchAndGetFiles(PHOTOS_DIR, 3500, (file) => {
            process.stdout.write((++counter).toString(), 'files');
        })
            .then(() => {
                done('Promise should not resolve');
            })
            .catch((error) => {
                expect(error).to.be.instanceof(RaspistillInterruptError);
                done();
            });

        childProcess.spawn('node', [__dirname + '/helpers/child_process_timelapse_file.js']);
        watcher.closeWatcher();
    });

    after(function(done: MochaDone): void {
        rimraf(PHOTOS_DIR, (err) => {
            if (err) {
                done(err);
            } else {
                done();
            }
        });
    });
});