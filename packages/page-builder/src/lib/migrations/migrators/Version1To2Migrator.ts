import { AREA, errorStack, logServer } from "@znode/logger/server";
import { IVersionMigrator, JsonObject } from "../types";
import { IPageStructure } from "@znode/types/visual-editor";
import { Data } from "@measured/puck";

export class Version1To2Migrator implements IVersionMigrator {
  public targetVersion = 2;
  public sourceVersion = 1;

  public migrate(json: JsonObject): JsonObject {
    const migratedJson = this.transformFlexToContainer(json);
    return { ...migratedJson, version: this.targetVersion };
  }

  private transformFlexToContainer(pageStructure: IPageStructure): IPageStructure {
    const defaultData = { content: [], zones: {}, root: {} };

    return {
      ...pageStructure,
      data: this.transform(pageStructure.data, "Flex", "Container"),
      footerData: this.transform(pageStructure.footerData || defaultData, "Flex", "Container"),
    };
  }

  private transform(data: Data, existingKey: string, newKey: string): Data {
    try {
      const updatedContent = data.content.map((item) =>
        item.type === existingKey
          ? {
              ...item,
              type: newKey,
              props: { ...item.props, id: item.props.id.replace(existingKey, newKey) },
            }
          : item
      );

      const updatedZones: typeof data.zones = {};
      for (const [zoneId, zoneComponents] of Object.entries(data.zones || {})) {
        const updatedZoneId = zoneId.replace(/flex/gi, newKey);
        updatedZones[updatedZoneId] = zoneComponents.map((comp) =>
          comp.type === existingKey
            ? {
                ...comp,
                type: newKey,
                props: { ...comp.props, id: comp.props.id.replace(existingKey, newKey) },
              }
            : comp
        );
      }

      return { ...data, content: updatedContent, zones: updatedZones };
    } catch (error) {
      logServer.error(AREA.PAGE_JSON_MIGRATION, `Error in transforming flex→container. Method: transform. Error: ${errorStack(error)}`);
      throw error;
    }
  }
}