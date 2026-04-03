import { Version1To2Migrator } from "./migrators";
import { IVersionMigrator } from "./types";

export class MigrationPipeline {
  private static migrators: IVersionMigrator[] = [
    new Version1To2Migrator(),
    // new Version2To3Migrator(),
    // new Version3To4Migrator(),
    // ...
  ];

  public static migrateToLatest(json: any, targetVersion: number): any {
    let currentVersion = json.version || 1;
    let migratedJson = json;

    while (currentVersion < targetVersion) {
      const migrator = this.migrators.find((m) => m.sourceVersion === currentVersion);
      if (!migrator) throw new Error(`MIGRATOR_NOT_FOUND: No forward migrator for v${currentVersion}`);
      try {
        migratedJson = migrator.migrate(migratedJson);
      } catch (err: any) {
        throw new Error(`MIGRATOR_FAILED: Migration from v${currentVersion} failed → ${err?.message}`);
      }
      currentVersion = migrator.targetVersion;
    }

    return migratedJson;
  }
}
