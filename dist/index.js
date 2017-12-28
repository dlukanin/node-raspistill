"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var default_1 = require("./lib/camera/default");
exports.Raspistill = default_1.DefaultCamera;
var interrupt_1 = require("./lib/error/interrupt");
exports.RaspistillInterruptError = interrupt_1.RaspistillInterruptError;
var raspistill_1 = require("./lib/error/raspistill");
exports.RaspistillDefaultError = raspistill_1.RaspistillDefaultError;
