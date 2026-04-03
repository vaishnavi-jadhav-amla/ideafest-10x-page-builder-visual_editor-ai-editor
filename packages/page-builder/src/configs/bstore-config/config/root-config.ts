import type { IConfigParam } from "../../../types/page-builder";
import { extendConfig } from "../../base-config/config/extend-config";
import { retrieveData } from "../../base-config/config/page-config-map";
import { addOrOverrideComponents } from "./override-component-list";

export async function getRootConfig(params: IConfigParam) {
  //** Override your components or add new components here!
  let selectedConfig: any = {};
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
