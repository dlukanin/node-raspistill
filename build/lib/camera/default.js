"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var abstract_1 = require("./abstract");
var child_process_1 = require("child_process");
var DefaultCamera = (function (_super) {
    __extends(DefaultCamera, _super);
    function DefaultCamera() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.takePhoto = function (fileName) {
            var cameraFileName = _this.getOption('fileName') || Date.now().toString();
            var cameraEncoding = _this.getOption('encoding');
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
                new Promise(function (resolve, reject) {
                    child_process_1.execFile(_this.command, _this.processOptions({
                        fileName: cameraFileName,
                        encoding: cameraEncoding
                    }), function (error, stdout, stderr) {
                        if (error) {
                            reject(error);
                        }
                        resolve(stdout);
                    });
                }),
                _this.watcher.watch(_this.getOption('outputDir') + (cameraFileName + '.' + cameraEncoding))
            ])
                .then(function (arr) {
                return arr[1];
            })
                .catch(function (error) {
                throw new Error((new Date()).toISOString() + ' Raspistill failed: ' + error.message);
            });
        };
        return _this;
    }
    return DefaultCamera;
}(abstract_1.AbstractCamera));
exports.DefaultCamera = DefaultCamera;
