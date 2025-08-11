// src/time.ts
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
import { TZ } from "./config";
dayjs.extend(utc); dayjs.extend(tz);

export const todayStr = () => dayjs().tz(TZ).format("YYYY-MM-DD");
