import { IComponents } from "../../base-config/config/extend-config";
import { ButtonConfig } from "../widgets/ui-widgets/button/ButtonConfig";
import { CardConfig } from "../widgets/ui-widgets/card/CardConfig";

export const addOrOverrideComponents: IComponents = {
      SafetygearButton: ButtonConfig,
      Card: CardConfig,
};
