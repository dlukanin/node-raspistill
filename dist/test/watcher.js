"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var default_1 = require("../lib/watcher/default");
var default_2 = require("../lib/watcher/options/default");
var chai_1 = require("chai");
var rmdir = require("rmdir");
var fs = require('fs-promise');
var PHOTOS_DIR = './photos/';
var childProcess = require("child_process");
var interrupt_1 = require("../lib/error/interrupt");
describe('watcher', function () {
    var FILE_NAME = '1.txt';
    var FILE_DATA = 'test';
    this.timeout(5000);
    var watcher = new default_1.DefaultWatcher({ expireTime: 2000 });
    it('should create dir if not exists', function (done) {
        fs.rmdir(PHOTOS_DIR)
            .catch(function (error) {
            return;
        })
            .then(function () { return watcher.watchAndGetFile(PHOTOS_DIR + FILE_NAME); })
            .catch(function (error) {
            return;
        })
            .then(function () { return fs.access(PHOTOS_DIR); })
            .then(function () {
            done();
        })
            .catch(function (error) {
            done(error);
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
        var watcherPromise = watcher.watchAndGetFile(PHOTOS_DIR + FILE_NAME).then(function (file) {
            chai_1.expect(file).to.be.instanceof(Buffer);
            chai_1.expect(file.toString()).to.eq('test');
        });
        var fsPromise = fs.writeFile(PHOTOS_DIR + FILE_NAME, FILE_DATA);
        Promise.all([watcherPromise, fsPromise])
            .then(function () {
            done();
        })
            .catch(function (error) {
            done(error);
        });
    });
    it('should return error if no file exists after timeout', function (done) {
        watcher.watchAndGetFile(PHOTOS_DIR + '2.txt').catch(function (error) {
            chai_1.expect(error).to.eql(new Error('No taken photo found'));
            chai_1.expect(error.message).to.eq('No taken photo found');
            done();
        })
            .catch(function (err) {
            done(err);
        });
    });
    it('should close watcher process (watchAndGetFile method)', function (done) {
        var watcherPromise = watcher.watchAndGetFile(PHOTOS_DIR + '3.txt').then(function (file) {
            done('Watcher should not trigger');
        });
        var fsPromise = fs.writeFile(PHOTOS_DIR + '3.txt', FILE_DATA);
        watcher.closeWatcher();
        Promise.all([watcherPromise, fsPromise])
            .then(function () {
            done('Promise should not resolve');
        })
            .catch(function (error) {
            chai_1.expect(error).to.be.instanceof(interrupt_1.RaspistillInterruptError);
            done();
        });
    });
    it('should close watcher process (watchAndGetFiles method)', function (done) {
        var counter = 0;
        watcher.watchAndGetFiles(PHOTOS_DIR, 3500, function (file) {
            process.stdout.write((++counter).toString(), 'files');
        })
            .then(function () {
            done('Promise should not resolve');
        })
            .catch(function (error) {
            chai_1.expect(error).to.be.instanceof(interrupt_1.RaspistillInterruptError);
            done();
        });
        childProcess.spawn('node', [__dirname + '/helpers/child_process_timelapse_file.js']);
        watcher.closeWatcher();
    });
    after(function (done) {
        rmdir(PHOTOS_DIR, function (err) {
            if (err) {
                done(err);
            }
            else {
                done();
            }
        });
    });
});
