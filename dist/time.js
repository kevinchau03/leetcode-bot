"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.todayStr = void 0;
// src/time.ts
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
const config_1 = require("./config");
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
const todayStr = () => (0, dayjs_1.default)().tz(config_1.TZ).format("YYYY-MM-DD");
exports.todayStr = todayStr;
