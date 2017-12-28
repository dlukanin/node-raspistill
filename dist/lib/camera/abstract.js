"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var default_1 = require("./options/default");
var assign = require("object.assign");
var AbstractCamera = (function () {
    function AbstractCamera(options) {
        if (options === void 0) { options = {}; }
        this.options = {};
        this.optionsMap = {
            verticalFlip: '-vf',
            horizontalFlip: '-hf',
            noPreview: '-n',
            encoding: '-e',
            width: '-w',
            height: '-h',
            timelapse: '-tl',
            time: '-t',
            shutterspeed: '-ss',
            contrast: '-co',
            brightness: '-br',
            saturation: '-sa',
            iso: '-ISO'
        };
        var opts = assign({}, AbstractCamera.DEFAULT_OPTIONS, options);
        this.setOptions(opts);
    }
    AbstractCamera.prototype.setOptions = function (options) {
        var _this = this;
        if (!options) {
            return;
        }
        Object.keys(default_1.defaultOptions).forEach(function (key) {
            var value = options[key];
            if (value === undefined) {
                value = _this.options[key];
            }
            if (typeof value !== 'undefined') {
                _this.options[key] = value;
            }
            if (typeof default_1.defaultOptions[key] === 'undefined' &&
                options.hasOwnProperty(key) && typeof options[key] === 'undefined') {
                _this.options[key] = undefined;
            }
        });
        this.options.width = this.options.width || this.options.height;
        this.options.height = this.options.height || this.options.width;
        if (this.options.width) {
            this.options.width = Math.round(this.options.width);
        }
        if (this.options.height) {
            this.options.height = Math.round(this.options.height);
        }
    };
    AbstractCamera.prototype.setDefaultOptions = function () {
        this.options = default_1.defaultOptions;
    };
    AbstractCamera.prototype.getOption = function (key) {
        return this.options[key];
    };
    AbstractCamera.prototype.getOptions = function () {
        return this.options;
    };
    AbstractCamera.prototype.processOptions = function (newOptions) {
        var _this = this;
        var currentOptions = assign({}, this.options, newOptions);
        var processedOptions = [];
        Object.keys(currentOptions).forEach(function (key) {
            if (!_this.optionsMap.hasOwnProperty(key)) {
                return;
            }
            if (currentOptions[key] === true) {
                processedOptions.push(_this.optionsMap[key]);
            }
            if (typeof currentOptions[key] === 'string' || typeof currentOptions[key] === 'number') {
                processedOptions.push(_this.optionsMap[key]);
                processedOptions.push(currentOptions[key].toString());
            }
        });
        processedOptions.push('-o');
        processedOptions.push(this.getOption('noFileSave') === true ? '-' :
            (currentOptions.outputDir + '/' + currentOptions.fileName + '.' + currentOptions.encoding));
        return processedOptions;
    };
    AbstractCamera.DEFAULT_OPTIONS = default_1.defaultOptions;
    return AbstractCamera;
}());
exports.AbstractCamera = AbstractCamera;
