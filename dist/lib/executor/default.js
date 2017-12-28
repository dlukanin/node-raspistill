"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var imageType = require("image-type");
var interrupt_1 = require("../error/interrupt");
var DefaultRaspistillExecutor = (function () {
    function DefaultRaspistillExecutor() {
        this.command = 'raspistill';
        this.maxBuffer = 400 * 1024;
    }
    DefaultRaspistillExecutor.prototype.exec = function (args) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.childProcess = child_process_1.execFile(_this.command, args, {
                maxBuffer: _this.maxBuffer,
                encoding: 'binary'
            }, function (error, stdout, stderr) {
                if (error) {
                    reject(error);
                }
                resolve(stdout);
            });
        });
    };
    DefaultRaspistillExecutor.prototype.spawnAndGetImage = function (args) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var photoBuffer = new Buffer(0);
            var errorBuffer = new Buffer(0);
            var error;
            var childProcess = child_process_1.spawn(_this.command, args);
            childProcess.on('error', function (processError) {
                error = processError;
            });
            childProcess.on('exit', function (code, signal) {
                if (signal === DefaultRaspistillExecutor.FORCE_CLOSE_SIGNAL) {
                    reject(new interrupt_1.RaspistillInterruptError());
                    return;
                }
                if (error) {
                    reject(error);
                    return;
                }
                if (errorBuffer.toString().length) {
                    reject(new Error(errorBuffer.toString()));
                    return;
                }
                resolve(photoBuffer);
            });
            childProcess.stdout.on('data', function (data) {
                photoBuffer = Buffer.concat([photoBuffer, data]);
            });
            childProcess.stderr.on('data', function (data) {
                errorBuffer = Buffer.concat([errorBuffer, data]);
            });
            _this.childProcess = childProcess;
        });
    };
    DefaultRaspistillExecutor.prototype.spawnAndGetImages = function (args, cb) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var photoBuffer = new Buffer(0);
            var error;
            var childProcess = child_process_1.spawn(_this.command, args);
            childProcess.on('error', function (processError) {
                error = processError;
            });
            childProcess.on('exit', function (code, signal) {
                if (signal === DefaultRaspistillExecutor.FORCE_CLOSE_SIGNAL) {
                    reject(new interrupt_1.RaspistillInterruptError());
                    return;
                }
                if (error) {
                    childProcess.kill();
                    reject(error);
                    return;
                }
                cb(photoBuffer);
                resolve();
            });
            childProcess.stdout.on('data', function (data) {
                if (imageType(data) && photoBuffer.length) {
                    cb(photoBuffer);
                    photoBuffer = data;
                    return;
                }
                photoBuffer = Buffer.concat([photoBuffer, data]);
            });
            _this.childProcess = childProcess;
        });
    };
    DefaultRaspistillExecutor.prototype.killProcess = function () {
        if (this.childProcess) {
            this.childProcess.kill(DefaultRaspistillExecutor.FORCE_CLOSE_SIGNAL);
        }
    };
    DefaultRaspistillExecutor.FORCE_CLOSE_SIGNAL = 'SIGTERM';
    return DefaultRaspistillExecutor;
}());
exports.DefaultRaspistillExecutor = DefaultRaspistillExecutor;
