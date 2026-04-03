import { Data } from "@measured/puck";

export type JsonObject = { version: number; data: Data; key: string; footerData?: Data; headerData?: Data };

export interface IVersionMigrator {
  sourceVersion: number;
  targetVersion: number;
  migrate(json: JsonObject): JsonObject; // source → target
}
