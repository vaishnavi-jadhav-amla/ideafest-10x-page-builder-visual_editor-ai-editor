import type { IConfigParam } from "../../../types/page-builder";
import { extendConfig, IComponents } from "./extend-config";
import { pageConfigMap } from "./page-config-layout-map";

export function getRootConfig(params: IConfigParam) {
  //** Override your components or add new components here!
  const addOrOverrideComponents: IComponents = {};

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