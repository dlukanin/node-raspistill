"use strict";
var default_1 = require("../watcher/default");
var default_2 = require("./options/default");
var assign = require("object.assign");
var AbstractCamera = (function () {
    function AbstractCamera(options, watcher) {
        if (options === void 0) { options = {}; }
        if (watcher === void 0) { watcher = new default_1.DefaultWatcher(); }
        var _this = this;
        this.command = 'raspistill';
        this.options = {};
        this.optionsMap = {
            verticalFlip: '-vf',
            horizontalFlip: '-hf',
            encoding: '-e',
            width: '-w',
            height: '-h'
        };
        this.setOptions = function (options) {
            if (!options) {
                return;
            }
            Object.keys(default_2.defaultOptions).forEach(function (key) {
                var value = options[key] || _this.options[key];
                if (typeof value !== 'undefined') {
                    _this.options[key] = value;
                }
            });
        };
        this.getOption = function (key) {
            return _this.options[key];
        };
        this.getOptions = function () {
            return _this.options;
        };
        this.processOptions = function (newOptions) {
            var currentOptions = assign({}, _this.options, newOptions);
            var processedOptions = [];
            Object.keys(currentOptions).forEach(function (key) {
                if (!_this.optionsMap.hasOwnProperty(key)) {
                    return;
                }
                if (currentOptions[key] === true) {
                    processedOptions.push(_this.optionsMap[key]);
                }
                if (typeof currentOptions[key] === 'string') {
                    processedOptions.push(_this.optionsMap[key]);
                    processedOptions.push(currentOptions[key]);
                }
            });
            processedOptions.push('-o');
            processedOptions.push(currentOptions.outputDir + currentOptions.fileName + '.' + currentOptions.encoding);
            return processedOptions;
        };
        var opts = assign({}, AbstractCamera.DEFAULT_OPTIONS, options);
        this.setOptions(opts);
        this.watcher = watcher;
    }
    return AbstractCamera;
}());
AbstractCamera.DEFAULT_OPTIONS = default_2.defaultOptions;
exports.AbstractCamera = AbstractCamera;
