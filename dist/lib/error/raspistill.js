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
var RaspistillDefaultError = (function (_super) {
    __extends(RaspistillDefaultError, _super);
    function RaspistillDefaultError(message) {
        var _this = _super.call(this, 'Raspistill failed: ' + message) || this;
        _this.name = 'RaspistillDefaultError';
        _this.__proto__ = RaspistillDefaultError.prototype;
        return _this;
    }
    return RaspistillDefaultError;
}(Error));
exports.RaspistillDefaultError = RaspistillDefaultError;
