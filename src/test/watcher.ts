import {DefaultWatcher} from '../lib/watcher/default';
import defaultOptions from '../lib/watcher/options/default';
import {expect} from 'chai';
import {IWatcherOptions} from '../lib/watcher/interfaces';
import {TMochaDoneFunction} from './main';
/* tslint:disable */
const fs = require('fs-promise');
/* tslint:enable */
const PHOTOS_DIR = './photos/';

describe('watcher', function(): void {
    const FILE_NAME = '1.txt';
    const FILE_DATA = 'test';

    this.timeout(4000);

    const watcher = new DefaultWatcher({expireTime: 2000});

    it('should create dir if not exists', function(done: TMochaDoneFunction): void {
        fs.rmdir(PHOTOS_DIR)
            .catch((error) => {
                return;
            })
            .then(() => watcher.watch(PHOTOS_DIR + FILE_NAME))
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

    it('should init/set options', function(done: TMochaDoneFunction): void {
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
        const testWatcher = new DefaultWatcher(opts);

        expect (testWatcher.getOptions()).to.eql(defaultOptions);

    });

    it('should return buffer object', function(done: TMochaDoneFunction): void {
        const watcherPromise = watcher.watch(PHOTOS_DIR + FILE_NAME).then((file) => {
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

    it('should return error if no file exists after timeout', function(done: TMochaDoneFunction): void {
        watcher.watch(PHOTOS_DIR + '2.txt').catch((error) => {
            expect(error).to.eql(new Error('No file found'));
            expect(error.message).to.eq('No file found');
            done();
        })
            .catch((err) => {
                done(err);
            });
    });

    after(function(done: TMochaDoneFunction): void {
        fs.unlink(PHOTOS_DIR + FILE_NAME)
            .then(() => {
                done();
            })
            .catch((error) => {
                done(error);
            });
    });
});