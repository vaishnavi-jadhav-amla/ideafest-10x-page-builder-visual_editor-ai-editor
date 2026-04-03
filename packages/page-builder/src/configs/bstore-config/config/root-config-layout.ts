import type { IConfigParam } from "../../../types/page-builder";
import { extendConfig, IComponents } from "../../base-config/config/extend-config";
import { addOrOverrideComponents } from "./override-component-list";
import { pageConfigMap } from "./page-config-layout-map";

export function getRootConfig(params: IConfigParam) {
  //** Get the selected Page configuration or set default fallback
  const selectedConfig = pageConfigMap.get(params.configType) || {
    components: {},
    removeComponentKeys: [],
    disabled: false,
    addComponentToCategories: [],
  };

  return extendConfig({
    addOrOverrideComponents: { ...addOrOverrideComponents, ...selectedConfig.components },
    removeComponentKeys: selectedConfig.removeComponentKeys,
    disabled: selectedConfig.disabled,
    addComponentToCategories: selectedConfig.addComponentToCategories,
  });
}