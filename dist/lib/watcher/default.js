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
var fs = require("fs");
var path = require("path");
var abstract_1 = require("./abstract");
var interrupt_1 = require("../error/interrupt");
var EVENT_RENAME = 'rename';
var EVENT_CHANGE = 'change';
var ENOENT = 'ENOENT';
var EEXISTS = 'EEXIST';
var DefaultWatcher = (function (_super) {
    __extends(DefaultWatcher, _super);
    function DefaultWatcher(options) {
        return _super.call(this, options) || this;
    }
    DefaultWatcher.prototype.watchAndGetFile = function (filePath, options) {
        var _this = this;
        var dirName = path.dirname(filePath);
        var fileName = path.basename(filePath);
        return new Promise(function (resolve, reject) {
            _this.makeDir(dirName);
            var timeout;
            var watcher = fs.watch(dirName, function (eventType, changedFileName) {
                if ((eventType === EVENT_RENAME || eventType === EVENT_CHANGE) && fileName === changedFileName) {
                    clearTimeout(timeout);
                    watcher.close();
                    fs.readFile(filePath, function (err, data) {
                        if (err) {
                            if (err.code === ENOENT) {
                                resolve(null);
                            }
                            reject(err);
                        }
                        resolve(data);
                    });
                }
            });
            timeout = setTimeout(function () {
                watcher.close();
                reject(new Error(DefaultWatcher.ERROR_NO_PHOTO));
            }, _this.getOption('expireTime'));
            _this.addForceCloseHandler(watcher, timeout, reject);
            _this.watcher = watcher;
        });
    };
    DefaultWatcher.prototype.watchAndGetFiles = function (dirPath, watchTimeMs, cb) {
        var _this = this;
        var dirName = path.basename(dirPath);
        return new Promise(function (resolve, reject) {
            _this.makeDir(dirName);
            var watcher = fs.watch(dirName, function (eventType, changedFileName) {
                if (changedFileName[changedFileName.length - 1] === DefaultWatcher.IMAGE_IN_PROGRESS_SYMBOL) {
                    return;
                }
                if ((eventType === EVENT_RENAME)) {
                    fs.readFile(dirName + '/' + changedFileName, function (err, data) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            cb(data);
                        }
                    });
                }
            });
            _this.addForceCloseHandler(watcher, setTimeout(function () {
                watcher.close();
                resolve();
            }, watchTimeMs), reject);
            _this.watcher = watcher;
        });
    };
    DefaultWatcher.prototype.closeWatcher = function () {
        if (this.watcher) {
            this.watcher.emit(DefaultWatcher.FORCE_CLOSE_EVENT);
        }
    };
    DefaultWatcher.prototype.makeDir = function (dirName) {
        try {
            fs.mkdirSync(dirName);
        }
        catch (err) {
            if (err.code !== EEXISTS) {
                throw err;
            }
        }
    };
    DefaultWatcher.prototype.addForceCloseHandler = function (watcher, timer, reject) {
        watcher.on(DefaultWatcher.FORCE_CLOSE_EVENT, function () {
            clearTimeout(timer);
            watcher.close();
            reject(new interrupt_1.RaspistillInterruptError());
        });
    };
    DefaultWatcher.IMAGE_IN_PROGRESS_SYMBOL = '~';
    DefaultWatcher.FORCE_CLOSE_EVENT = 'forceClose';
    DefaultWatcher.ERROR_NO_PHOTO = 'No taken photo found';
    return DefaultWatcher;
}(abstract_1.AbstractWatcher));
exports.DefaultWatcher = DefaultWatcher;
