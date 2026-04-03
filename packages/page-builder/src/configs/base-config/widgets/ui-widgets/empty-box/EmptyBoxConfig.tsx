import type { ComponentConfig } from "@measured/puck";
import { EmptyZoneRender } from "./EmptyBoxRender";

export interface IEmptyBoxConfig {}

export const EmptyBoxConfig: ComponentConfig<IEmptyBoxConfig> = {
  label: "Empty Box",
  permissions: {
    delete: false,
    edit: false,
    drag: false,
    duplicate: false,
    insert: false,
  },
  render: () => {
    return <EmptyZoneRender />;
  },
};
