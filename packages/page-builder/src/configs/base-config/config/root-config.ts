import type { IConfigParam } from "../../../types/page-builder";
import { extendConfig, IComponents } from "./extend-config";
import { addOrOverrideComponents } from "./override-component-list";
import { retrieveData } from "./page-config-map";

export async function getRootConfig(params: IConfigParam) {
  //** Override your components or add new components here!
  let selectedConfig: any = {};
  //** Get the selected Page configuration or set default fallback
  if (params.configType == "common") {
    selectedConfig = {
      components: {},
      removeComponentKeys: [],
      disabled: false,
      addComponentToCategories: [],
    };
  } else {
    selectedConfig = (await retrieveData(params.configType)) || {
      components: {},
      removeComponentKeys: [],
      disabled: false,
      addComponentToCategories: [],
    };
  }

  return extendConfig({
    addOrOverrideComponents: { ...addOrOverrideComponents, ...selectedConfig.components },
    removeComponentKeys: selectedConfig.removeComponentKeys,
    disabled: selectedConfig.disabled,
    addComponentToCategories: selectedConfig.addComponentToCategories,
  });
}
