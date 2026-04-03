/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { ILogEntry, ILogLevel } from "@znode/types/log";

import { logThreshold } from "../config";
import { sendLogs } from "../log-sender/send-logs";

const logBuffer: ILogEntry[] = [];
let logCount = 0;
const logThresholdCount: number = logThreshold;
const flushLogs = async (): Promise<void> => {
  if (logBuffer.length > 0) {
    try {
      await sendLogs(logBuffer);
      logBuffer.length = 0; // Clear buffer after sending
    } catch (error) {
      console.error("Failed to send logs:", error);
    }
  }
};

const log = (area = "", message = "", params: any = {}, level: ILogLevel = "Info") => {
  logBuffer.push({ message,  level, timestamp: new Date().toISOString(), area, params });
  logCount++;

  if (logCount >= logThresholdCount) {
    flushLogs();
    logCount = 0; // Reset count after flushing
  }
};

const logServer: {
  error: (area: string, message?: string, params?: any) => void;
  warn: (area: string, message?: string, params?: any) => void;
  info: (area: string, message?: string, params?: any) => void;
} = {
  error: (area: string, message?: string, params?: any) => {
    log(area, message, params, "Error");
  },
  warn: (area: string, message?: string, params?: any) => {
    log(area, message, params, "Warn");
  },
  info: (area: string, message?: string, params?: any) => {
    log(area, message, params, "Info");
  },
};

export { logServer };
