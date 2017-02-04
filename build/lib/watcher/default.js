"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var fs = require("fs");
var path = require("path");
var abstract_1 = require("./abstract");
var EVENT_RENAME = 'rename';
var EVENT_CHANGE = 'change';
var ENOENT = 'ENOENT';
var EEXISTS = 'EEXIST';
var DefaultWatcher = (function (_super) {
    __extends(DefaultWatcher, _super);
    function DefaultWatcher(options) {
        var _this = _super.call(this, options) || this;
        _this.watch = function (filePath, options) {
            var dirName = path.dirname(filePath);
            var fileName = path.basename(filePath);
            return new Promise(function (resolve, reject) {
                fs.mkdir(dirName, function (err) {
                    if (err) {
                        if (err.code !== EEXISTS) {
                            reject(err);
                        }
                    }
                    var watcher = fs.watch(dirName, function (eventType, changedFileName) {
                        if ((eventType === EVENT_RENAME || eventType === EVENT_CHANGE) && fileName === changedFileName) {
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
                    setTimeout(function () {
                        watcher.close();
                        reject(new Error('No file found'));
                    }, _this.getOption('expireTime'));
                });
            });
        };
        return _this;
    }
    return DefaultWatcher;
}(abstract_1.AbstractWatcher));
exports.DefaultWatcher = DefaultWatcher;
