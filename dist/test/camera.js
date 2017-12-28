"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var sinon = require("sinon");
var default_1 = require("../lib/camera/default");
var rmdir = require("rmdir");
var interrupt_1 = require("../lib/error/interrupt");
var child_process = require('child_process');
var fs = require('fs-promise');
describe('camera', function () {
    var sandbox = sinon.sandbox.create();
    var PHOTOS_DIR = './photos';
    var FILE_NAME = 'test';
    var FILE_ENC = 'jpg';
    var FILE_DATA = '111';
    var firstPhotoBuffer;
    var camera = new default_1.DefaultCamera({ outputDir: PHOTOS_DIR });
    this.timeout(4000);
    beforeEach(function (done) {
        sandbox.stub(child_process, 'execFile').callsFake(function (arg, secondArg, opts, callback) {
            fs.mkdir(PHOTOS_DIR)
                .catch(function () {
                return;
            })
                .then(function () { return fs.writeFile(PHOTOS_DIR + '/' + FILE_NAME + '.' + FILE_ENC, Date.now() + FILE_DATA); })
                .then(function () {
                callback(null, 'success');
            })
                .catch(function (error) {
                callback(error);
            });
        });
        done();
    });
    it('should round width and height values passed to constructor', function (done) {
        var camera = new default_1.DefaultCamera({
            width: 800.12,
            height: 599.90
        });
        chai_1.expect(camera.getOption('width')).to.eq(800);
        chai_1.expect(camera.getOption('height')).to.eq(600);
        done();
    });
    it('should use default args while executing raspistill command', function (done) {
        var camera = new default_1.DefaultCamera();
        camera.takePhoto();
        var args = child_process.execFile.args[0];
        chai_1.expect(args[0]).to.eql('raspistill');
        chai_1.expect(args[1]).to.eql(['-n', '-e', 'jpg', '-o', args[1][4]]);
        done();
    });
    it('should set default options', function (done) {
        var camera = new default_1.DefaultCamera({
            width: 1000,
            outputDir: PHOTOS_DIR + '/test'
        });
        camera.takePhoto('foo');
        var fooArgs = child_process.execFile.args[0];
        chai_1.expect(fooArgs[0]).to.eql('raspistill');
        chai_1.expect(fooArgs[1]).to.eql([
            '-n', '-e', 'jpg', '-w', '1000', '-h', '1000', '-o', PHOTOS_DIR + '/test/foo.jpg'
        ]);
        camera.setDefaultOptions();
        camera.takePhoto('bar');
        var barArgs = child_process.execFile.args[1];
        chai_1.expect(barArgs[0]).to.eql('raspistill');
        chai_1.expect(barArgs[1]).to.eql([
            '-n', '-e', 'jpg', '-o', 'photos/bar.jpg'
        ]);
        done();
    });
    it('should apply custom args raspistill command', function (done) {
        var camera = new default_1.DefaultCamera({
            verticalFlip: true,
            horizontalFlip: true,
            noPreview: false,
            outputDir: PHOTOS_DIR + '/test',
            fileName: 'foo',
            encoding: 'png',
            width: 1000,
            height: 800,
            shutterspeed: 10,
            iso: 100,
            brightness: 10,
            contrast: 10,
            saturation: 10,
            time: 1
        });
        camera.takePhoto();
        camera.takePhoto('test');
        camera.setOptions({
            noPreview: true,
            height: undefined
        });
        camera.takePhoto('anotherTest');
        var args = child_process.execFile.args[0];
        var secondCallArgs = child_process.execFile.args[1];
        var thirdCallArgs = child_process.execFile.args[2];
        chai_1.expect(args[0]).to.eql('raspistill');
        chai_1.expect(args[1]).to.eql([
            '-vf', '-hf', '-e', 'png', '-w', '1000', '-h', '800', '-t', '1',
            '-ISO', '100', '-ss', '10', '-co', '10', '-br', '10', '-sa', '10', '-o',
            PHOTOS_DIR + '/test/foo.png'
        ]);
        chai_1.expect(secondCallArgs[0]).to.eql('raspistill');
        chai_1.expect(secondCallArgs[1]).to.eql([
            '-vf', '-hf', '-e', 'png', '-w', '1000', '-h', '800', '-t', '1',
            '-ISO', '100', '-ss', '10', '-co', '10', '-br', '10', '-sa', '10', '-o',
            PHOTOS_DIR + '/test/test.png'
        ]);
        chai_1.expect(thirdCallArgs[0]).to.eql('raspistill');
        chai_1.expect(thirdCallArgs[1]).to.eql([
            '-vf', '-hf', '-e', 'png', '-w', '1000', '-h', '1000', '-t', '1',
            '-ISO', '100', '-ss', '10', '-co', '10', '-br', '10', '-sa', '10', '-n', '-o',
            PHOTOS_DIR + '/test/anotherTest.png'
        ]);
        done();
    });
    it('should return buffer object with noFileSave option', function (done) {
        var originalSpawn = child_process.spawn;
        sandbox.stub(child_process, 'spawn').callsFake(function (command, args) {
            return originalSpawn.call(child_process, 'node', [__dirname + '/helpers/child_process.js']);
        });
        var camera = new default_1.DefaultCamera({
            noFileSave: true,
            outputDir: PHOTOS_DIR + '/test',
            fileName: 'no_file_saved',
            encoding: 'jpg'
        });
        camera.takePhoto()
            .then(function (data) {
            chai_1.expect(data).to.be.instanceof(Buffer);
        })
            .catch(function (error) {
            done(error);
        });
        chai_1.expect(child_process.execFile.args.length).to.eq(0);
        var args = child_process.spawn.args[0];
        chai_1.expect(args[0]).to.eql('raspistill');
        chai_1.expect(args[1]).to.eql([
            '-n', '-e', 'jpg', '-o', '-'
        ]);
        done();
    });
    it('should take photo', function (done) {
        camera.takePhoto(FILE_NAME)
            .then(function (data) {
            chai_1.expect(data).to.be.instanceOf(Buffer);
            firstPhotoBuffer = data;
            done();
        })
            .catch(function (error) {
            done(error);
        });
    });
    it('should take photo with same name', function (done) {
        camera.takePhoto(FILE_NAME)
            .then(function (data) {
            chai_1.expect(data).to.be.instanceOf(Buffer);
            chai_1.expect(data).to.be.not.eql(firstPhotoBuffer);
            done();
        })
            .catch(function (error) {
            done(error);
        });
    });
    it('should exec camera in timelapse mode (no file save)', function (done) {
        this.timeout(4000);
        var originalSpawn = child_process.spawn;
        sandbox.stub(child_process, 'spawn').callsFake(function (command, args) {
            return originalSpawn.call(child_process, 'node', [__dirname + '/helpers/child_process_timelapse.js']);
        });
        var camera = new default_1.DefaultCamera({
            noFileSave: true,
            outputDir: PHOTOS_DIR + '/test',
            fileName: 'no_file_saved',
            encoding: 'jpg'
        });
        var i = 0;
        camera.timelapse(500, 3000, function (image) {
            chai_1.expect(image).to.be.instanceOf(Buffer);
            i++;
        }).then(function () {
            chai_1.expect(i).to.eq(5);
            done();
        }).catch(function (err) {
            done(err);
        });
        var args = child_process.spawn.args[0];
        chai_1.expect(args[0]).to.eql('raspistill');
        chai_1.expect(args[1]).to.eql([
            '-n', '-e', 'jpg', '-t', '3000', '-tl', '500', '-o', '-'
        ]);
    });
    it('should exec camera in timelapse mode (file save)', function (done) {
        this.timeout(5000);
        child_process.execFile.restore();
        sandbox.stub(child_process, 'execFile').callsFake(function (arg, secondArg, opts, callback) {
            var process = child_process.spawn('node', [__dirname + '/helpers/child_process_timelapse_file.js']);
            process.on('close', function () {
                callback(null, 'success');
            });
        });
        var camera = new default_1.DefaultCamera({
            outputDir: PHOTOS_DIR,
            fileName: 'image%04d',
            encoding: 'jpg'
        });
        var i = 0;
        camera.timelapse(500, 4000, function (image) {
            chai_1.expect(image).to.be.instanceOf(Buffer);
            i++;
        }).then(function () {
            chai_1.expect(i).to.eq(5);
            done();
        }).catch(function (err) {
            done(err);
        });
        var args = child_process.execFile.args[0];
        chai_1.expect(args[0]).to.eql('raspistill');
        chai_1.expect(args[1]).to.eql([
            '-n', '-e', 'jpg', '-t', '4000', '-tl', '500', '-o', PHOTOS_DIR + '/image%04d.jpg'
        ]);
    });
    it('should force stop (takePhoto)', function (done) {
        var camera = new default_1.DefaultCamera();
        camera.takePhoto()
            .then(function (photo) {
            done('Camera should not take photo');
        })
            .catch(function (error) {
            chai_1.expect(error).to.be.instanceOf(interrupt_1.RaspistillInterruptError);
            done();
        });
        camera.stop();
    });
    it('should force stop (takePhoto with no file save)', function (done) {
        this.timeout(4000);
        var originalSpawn = child_process.spawn;
        sandbox.stub(child_process, 'spawn').callsFake(function (command, args) {
            return originalSpawn.call(child_process, 'node', [__dirname + '/helpers/child_process_timelapse.js']);
        });
        var camera = new default_1.DefaultCamera({
            noFileSave: true
        });
        camera.takePhoto()
            .then(function (photo) {
            done('Camera should not take photo');
        })
            .catch(function (error) {
            chai_1.expect(error).to.be.instanceOf(interrupt_1.RaspistillInterruptError);
            done();
        });
        camera.stop();
    });
    it('should force stop (timelapse)', function (done) {
        this.timeout(4000);
        child_process.execFile.restore();
        sandbox.stub(child_process, 'execFile').callsFake(function (arg, secondArg, opts, callback) {
            var process = child_process.spawn('node', [__dirname + '/helpers/child_process_timelapse_file.js']);
            process.on('close', function () {
                callback(null, 'success');
            });
        });
        var camera = new default_1.DefaultCamera({
            outputDir: PHOTOS_DIR,
            fileName: 'image%04d',
            encoding: 'jpg'
        });
        var i = 0;
        camera.timelapse(500, 3000, function (image) {
            i++;
        }).then(function () {
            done('Timelapse should not resolve');
        }).catch(function (err) {
            chai_1.expect(err).to.be.instanceOf(interrupt_1.RaspistillInterruptError);
            done();
        });
        camera.stop();
    });
    it('should force stop (timelapse with no file save)', function (done) {
        this.timeout(4000);
        var originalSpawn = child_process.spawn;
        sandbox.stub(child_process, 'spawn').callsFake(function (command, args) {
            return originalSpawn.call(child_process, 'node', [__dirname + '/helpers/child_process_timelapse.js']);
        });
        var camera = new default_1.DefaultCamera({
            noFileSave: true,
            outputDir: PHOTOS_DIR + '/test'
        });
        var i = 0;
        camera.timelapse(500, 3000, function (image) {
            i++;
        }).then(function () {
            done('Timelapse should not resolve');
        }).catch(function (err) {
            chai_1.expect(err).to.be.instanceOf(interrupt_1.RaspistillInterruptError);
            done();
        });
        camera.stop();
    });
    afterEach(function () {
        sandbox.restore();
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
