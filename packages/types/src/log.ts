/* eslint-disable @typescript-eslint/no-explicit-any */
export type ILogLevel = "Info" | "Warn" | "Error" | "Debug";

export interface ILogEntry {
  message: string;
  level: ILogLevel;
  timestamp: string;
  area: string;
  params?: any;
}
