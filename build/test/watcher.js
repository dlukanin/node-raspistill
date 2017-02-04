"use strict";
var default_1 = require("../lib/watcher/default");
var default_2 = require("../lib/watcher/options/default");
var fs = require("fs");
var chai_1 = require("chai");
var PHOTOS_DIR = './photos/';
describe('watcher', function () {
    var FILE_NAME = '1.txt';
    var FILE_DATA = 'test';
    this.timeout(4000);
    var watcher = new default_1.DefaultWatcher({ expireTime: 2000 });
    it('should create dir if not exists', function (done) {
        fs.rmdir(PHOTOS_DIR, function (err) {
            if (err) {
                done(err);
            }
            else {
                watcher.watch(PHOTOS_DIR + FILE_NAME);
                fs.access(PHOTOS_DIR, function (err) {
                    if (err) {
                        done(err);
                    }
                    else {
                        done();
                    }
                });
            }
        });
    });
    it('should init/set options', function (done) {
        var options = { expireTime: 2000 };
        var testWatcher = new default_1.DefaultWatcher(options);
        chai_1.expect(testWatcher.getOptions()).to.eql(options);
        options.expireTime = 2600;
        chai_1.expect(testWatcher.getOptions()).not.to.eql(options);
        testWatcher.setOptions(options);
        chai_1.expect(testWatcher.getOptions()).to.eql(options);
        done();
    });
    it('should ignore non WatcherOptions attrs', function () {
        var opts = { foo: 1 };
        var testWatcher = new default_1.DefaultWatcher(opts);
        chai_1.expect(testWatcher.getOptions()).to.eql(default_2.default);
    });
    it('should return buffer object', function (done) {
        watcher.watch(PHOTOS_DIR + FILE_NAME).then(function (file) {
            chai_1.expect(file).to.be.instanceof(Buffer);
            chai_1.expect(file.toString()).to.eq('test');
            done();
        })
            .catch(function (err) {
            done(err);
        });
        fs.writeFile(PHOTOS_DIR + FILE_NAME, FILE_DATA, function (err) {
            if (err) {
                done(err);
            }
        });
    });
    it('should return error if no file exists after timeout', function (done) {
        watcher.watch(PHOTOS_DIR + '2.txt').catch(function (error) {
            chai_1.expect(error).to.eql(new Error('No file found'));
            chai_1.expect(error.message).to.eq('No file found');
            done();
        })
            .catch(function (err) {
            done(err);
        });
    });
    after(function (done) {
        fs.unlink(PHOTOS_DIR + FILE_NAME, function (err) {
            if (err) {
                done(err);
            }
            else {
                done();
            }
        });
    });
});
