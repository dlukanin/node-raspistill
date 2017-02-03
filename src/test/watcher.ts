import {DefaultWatcher} from '../lib/watcher/default';
import defaultOptions from '../lib/watcher/options/default';
import * as fs from 'fs-extra';
import {expect} from 'chai';
import {IWatcherOptions} from "../lib/watcher/interfaces";

const PHOTOS_DIR = './photos/';

describe('watcher', function() {
    const FILE_NAME = '1.txt';
    const FILE_DATA = 'test';

    this.timeout(4000);

    const watcher = new DefaultWatcher({expireTime: 2000});

    it('should create dir if not exists', function(done) {
        fs.rmdirSync(PHOTOS_DIR);
        watcher.watch(PHOTOS_DIR + FILE_NAME);
        try {
            fs.accessSync(PHOTOS_DIR, fs.constants.F_OK);
            done();
        } catch (error) {
            done(error)
        }
    });

    it('should init/set options', function(done) {
        const options: IWatcherOptions = {expireTime: 2000, recursive: true};

        const testWatcher = new DefaultWatcher(options);

        expect(testWatcher.getOptions()).to.eql(options);
        options.expireTime = 2600;
        expect(testWatcher.getOptions()).not.to.eql(options);
        testWatcher.setOptions(options);
        expect(testWatcher.getOptions()).to.eql(options);
        done();
    });

    it('should ignore non WatcherOptions attrs', function() {
        const opts = {foo: 1};
        const testWatcher = new DefaultWatcher(opts);

        expect (testWatcher.getOptions()).to.eql(defaultOptions);

    });

    it('should return buffer object', function(done) {
        watcher.watch(PHOTOS_DIR + FILE_NAME).then((file) => {
            expect(file).to.be.instanceof(Buffer);
            expect(file.toString()).to.eq('test');
            done();
        })
            .catch((err) => {
                done(err);
            });
        fs.writeFile(PHOTOS_DIR + FILE_NAME, FILE_DATA, function(err) {
            if (err) {
                done(err);
            }
        });
    });

    it('should return error if no file exists after timeout', function(done) {
        watcher.watch(PHOTOS_DIR + '2.txt').catch((error) => {
            expect(error).to.eql(new Error('No file found'));
            expect(error.message).to.eq('No file found');
            done();
        })
            .catch((err) => {
                done(err);
            });
    });

    it('should return null on deleting files', function(done) {
        fs.writeFile(PHOTOS_DIR + FILE_NAME, FILE_DATA, function(err) {
            if (err) {
                done(err);
            }

            watcher.watch(PHOTOS_DIR + FILE_NAME).then((file) => {
                expect(file).to.eq(null);
                done();
            })
                .catch((err) => {
                    done(err);
                });

            fs.unlink(PHOTOS_DIR + FILE_NAME, function(err) {
                if (err) {
                    done(err);
                }
            });
        });
    });
});