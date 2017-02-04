"use strict";
var default_1 = require("./options/default");
var assign = require("object.assign");
var AbstractWatcher = (function () {
    function AbstractWatcher(options) {
        if (options === void 0) { options = {}; }
        var _this = this;
        this.options = {};
        this.setOptions = function (options) {
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
        this.getOption = function (key) {
            return _this.options[key];
        };
        this.getOptions = function () {
            return _this.options;
        };
        var opts = assign({}, AbstractWatcher.DEFAULT_OPTIONS, options);
        this.setOptions(opts);
    }
    return AbstractWatcher;
}());
AbstractWatcher.DEFAULT_OPTIONS = default_1.default;
exports.AbstractWatcher = AbstractWatcher;
