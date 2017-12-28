"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var default_1 = require("./options/default");
var assign = require("object.assign");
var AbstractWatcher = (function () {
    function AbstractWatcher(options) {
        if (options === void 0) { options = {}; }
        this.options = {};
        var opts = assign({}, AbstractWatcher.DEFAULT_OPTIONS, options);
        this.setOptions(opts);
    }
    AbstractWatcher.prototype.setOptions = function (options) {
        var _this = this;
        if (!options) {
            return;
        }
        Object.keys(default_1.default).forEach(function (key) {
            var value = options[key] || _this.options[key];
            if (typeof value !== 'undefined') {
                _this.options[key] = value;
            }
        });
    };
    AbstractWatcher.prototype.getOption = function (key) {
        return this.options[key];
    };
    AbstractWatcher.prototype.getOptions = function () {
        return this.options;
    };
    AbstractWatcher.DEFAULT_OPTIONS = default_1.default;
    return AbstractWatcher;
}());
exports.AbstractWatcher = AbstractWatcher;
