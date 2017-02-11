import {DefaultWatcher} from '../lib/watcher/default';
import defaultOptions from '../lib/watcher/options/default';
import * as fs from 'fs';
import {expect} from 'chai';
import {IWatcherOptions} from '../lib/watcher/interfaces';

const PHOTOS_DIR = './photos/';
// TODO promisify fs
describe('watcher', function(): void {
    const FILE_NAME = '1.txt';
    const FILE_DATA = 'test';

    this.timeout(4000);

    const watcher = new DefaultWatcher({expireTime: 2000});

    it('should create dir if not exists', function(done: Function): void {
        fs.rmdir(PHOTOS_DIR, (err: any) => {
            watcher.watch(PHOTOS_DIR + FILE_NAME)
                .catch(() => {
                    return;
                })
                .then(() => {
                    fs.access(PHOTOS_DIR, (err: any) => {
                        if (err) {
                            done(err);
                        } else {
                            done();
                        }
                    });
                });
        });
    });

    it('should init/set options', function(done: Function): void {
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

    it('should return buffer object', function(done: Function): void {
        watcher.watch(PHOTOS_DIR + FILE_NAME).then((file) => {
            expect(file).to.be.instanceof(Buffer);
            expect(file.toString()).to.eq('test');
            done();
        })
            .catch((err) => {
                done(err);
            });
        fs.writeFile(PHOTOS_DIR + FILE_NAME, FILE_DATA, (err) => {
            if (err) {
                done(err);
            }
        });
    });

    it('should return error if no file exists after timeout', function(done: Function): void {
        watcher.watch(PHOTOS_DIR + '2.txt').catch((error) => {
            expect(error).to.eql(new Error('No file found'));
            expect(error.message).to.eq('No file found');
            done();
        })
            .catch((err) => {
                done(err);
            });
    });

    after(function(done: Function): void {
        fs.unlink(PHOTOS_DIR + FILE_NAME, (err) => {
            if (err) {
                done(err);
            } else {
                done();
            }
        });
    });
});