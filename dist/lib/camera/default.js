"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var abstract_1 = require("./abstract");
var default_1 = require("../watcher/default");
var default_2 = require("../executor/default");
var interrupt_1 = require("../error/interrupt");
var raspistill_1 = require("../error/raspistill");
var DefaultCamera = (function (_super) {
    __extends(DefaultCamera, _super);
    function DefaultCamera(options, watcher, executor) {
        if (options === void 0) { options = {}; }
        if (watcher === void 0) { watcher = new default_1.DefaultWatcher(); }
        if (executor === void 0) { executor = new default_2.DefaultRaspistillExecutor(); }
        var _this = _super.call(this, options) || this;
        _this.watcher = watcher;
        _this.executor = executor;
        return _this;
    }
    DefaultCamera.prototype.timelapse = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var fileName;
        var intervalMs;
        var execTimeMs;
        var cb;
        if (typeof args[0] === 'string') {
            fileName = args[0];
            intervalMs = args[1];
            execTimeMs = args[2];
            cb = args[3];
        }
        else {
            intervalMs = args[0];
            execTimeMs = args[1];
            cb = args[2];
        }
        if (this.getOption('noFileSave')) {
            return this.executor.spawnAndGetImages(this.processOptions({
                time: execTimeMs,
                timelapse: intervalMs,
                fileName: fileName
            }), cb)
                .catch(this.processError);
        }
        var cameraFileName = this.getOption('fileName') || Date.now().toString() + '%04d';
        var cameraEncoding = this.getOption('encoding');
        if (fileName && fileName.length) {
            var processedFileName = fileName.split('.');
            if (processedFileName.length > 1) {
                cameraFileName = processedFileName[0];
                cameraEncoding = processedFileName[1];
            }
            else {
                cameraFileName = fileName;
            }
        }
        return Promise.all([
            this.executor.exec(this.processOptions({
                fileName: cameraFileName,
                encoding: cameraEncoding,
                time: execTimeMs,
                timelapse: intervalMs
            })),
            this.watcher.watchAndGetFiles(this.getOption('outputDir'), execTimeMs, cb)
        ])
            .then(function () { return; })
            .catch(this.processError);
    };
    DefaultCamera.prototype.takePhoto = function (fileName) {
        if (this.getOption('noFileSave') === true) {
            return this.executor.spawnAndGetImage(this.processOptions())
                .catch(this.processError);
        }
        var cameraFileName = this.getOption('fileName') || Date.now().toString();
        var cameraEncoding = this.getOption('encoding');
        if (fileName && fileName.length) {
            var processedFileName = fileName.split('.');
            if (processedFileName.length > 1) {
                cameraFileName = processedFileName[0];
                cameraEncoding = processedFileName[1];
            }
            else {
                cameraFileName = fileName;
            }
        }
        return Promise.all([
            this.executor.exec(this.processOptions({
                fileName: cameraFileName,
                encoding: cameraEncoding
            })),
            this.watcher.watchAndGetFile(this.getOption('outputDir') + '/' + (cameraFileName + '.' + cameraEncoding))
        ])
            .then(function (result) {
            if (result instanceof Array) {
                return result[1];
            }
            return result;
        })
            .catch(this.processError);
    };
    DefaultCamera.prototype.stop = function () {
        this.watcher.closeWatcher();
        this.executor.killProcess();
    };
    DefaultCamera.prototype.processError = function (error) {
        if (error instanceof interrupt_1.RaspistillInterruptError) {
            throw error;
        }
        throw new raspistill_1.RaspistillDefaultError(error.message);
    };
    return DefaultCamera;
}(abstract_1.AbstractCamera));
exports.DefaultCamera = DefaultCamera;
