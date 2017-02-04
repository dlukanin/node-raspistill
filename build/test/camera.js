"use strict";
var chai_1 = require("chai");
var fs = require("fs");
var sinon = require("sinon");
var child_process = require("child_process");
var default_1 = require("../lib/camera/default");
describe('camera', function () {
    var sandbox = sinon.sandbox.create();
    var PHOTOS_DIR = './photos/';
    var FILE_NAME = 'test';
    var FILE_ENC = 'jpg';
    var FILE_DATA = '111';
    var firstPhotoBuffer;
    var camera = new default_1.DefaultCamera({ outputDir: PHOTOS_DIR });
    this.timeout(4000);
    beforeEach(function (done) {
        sandbox.stub(child_process, 'execFile', function (arg, secondArg, callback) {
            fs.mkdir(PHOTOS_DIR, function (err) {
                fs.writeFile(PHOTOS_DIR + FILE_NAME + '.' + FILE_ENC, Date.now() + FILE_DATA, function (err) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        callback(null, 'success');
                    }
                });
            });
        });
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
    afterEach(function () {
        sandbox.restore();
    });
    after(function (done) {
        fs.unlink(PHOTOS_DIR + FILE_NAME + '.' + FILE_ENC, function (err) {
            if (err) {
                done(err);
            }
            else {
                done();
            }
        });
    });
});
