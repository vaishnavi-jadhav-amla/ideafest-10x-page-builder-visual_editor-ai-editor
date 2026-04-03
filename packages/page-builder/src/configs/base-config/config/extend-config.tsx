import { Config, DropZone } from "@measured/puck";
import type { IRemoveComponentKeys } from "../../../types/page-builder";
import { baseComponentsConfig } from "./base-components-config";
import { produce } from "immer";

export type IComponents = Config["components"];

type IAddComponentToCategories = IRemoveComponentKeys;

interface IExtendConfigParams {
  removeComponentKeys?: IRemoveComponentKeys;
  addComponentToCategories?: IAddComponentToCategories;

  addOrOverrideComponents: IComponents;
  disabled?: boolean;
}

export function extendConfig(extendConfigParams: IExtendConfigParams) {
  const { addOrOverrideComponents, removeComponentKeys = [], disabled, addComponentToCategories = [] } = extendConfigParams;

  const config = baseComponentsConfig;

  const componentsKeyToRemove = removeComponentKeys.flatMap((item) => item.componentKeys);

  return produce(config, (draft) => {
    draft.root = {
      fields: {
        title: {
          type: "custom",
          render: () => <></>,
        },
      },
    };

    if (disabled) {
      draft.root.render = () => <DropZone zone="default-zone" allow={[]} />;
    }

    //** Add or Override Components  */
    Object.assign(draft.components, addOrOverrideComponents);

    //** Add Components to Categories */
    if (draft.categories && addComponentToCategories && Array.isArray(addComponentToCategories)) {
      const categories = draft.categories;
      addComponentToCategories.forEach((item) => {
        const { categoryKey, componentKeys } = item;
        const category = categories[categoryKey as keyof typeof draft.categories];
        if (category?.components) {
          category.components = [...category.components, ...componentKeys] as any[];
        }
      });
    }

    //** Remove Components */
    componentsKeyToRemove.forEach((componentKey) => {
      delete draft.components[componentKey as keyof typeof draft.components];
    });

    //** Remove Components from Categories */
    if (draft.categories) {
      const categories = draft.categories;
      removeComponentKeys.forEach((item) => {
        const { categoryKey, componentKeys } = item;
        const category = categories[categoryKey as keyof typeof draft.categories];
        if (category?.components) {
          category.components = category.components.filter((com) => !componentKeys.includes(com));
        }
      });
    }
  });
}
