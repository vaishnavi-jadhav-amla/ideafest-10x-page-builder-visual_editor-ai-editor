import { addOrOverrideComponents as bstoreAddOrOverrideComponents } from "./bstore-config/config/override-component-list";
import { addOrOverrideComponents as theme1AddOrOverrideComponents } from "./theme1-config/config/override-component-list";
import { addOrOverrideComponents as theme2AddOrOverrideComponents } from "./theme2-config/config/override-component-list";
import { addOrOverrideComponents as safetygearAddOrOverrideComponents } from "./safetygear-config/config/override-component-list";

import { addOrOverrideComponents } from "../configs/base-config/config/override-component-list";
const themeConfigLoaders = new Map<string, typeof addOrOverrideComponents>([
  ["bstore", bstoreAddOrOverrideComponents],
  ["theme1", theme1AddOrOverrideComponents],
  ["theme2", theme2AddOrOverrideComponents],
  ["safetygear", safetygearAddOrOverrideComponents],
]);

export function getThemeComponents(themeName: string) {
  return themeConfigLoaders.get(themeName) || addOrOverrideComponents;
}
