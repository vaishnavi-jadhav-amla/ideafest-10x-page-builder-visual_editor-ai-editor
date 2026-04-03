import { IComponents } from "../../base-config/config/extend-config";
import { TextConfig } from "../widgets/ui-widgets/text/TextConfig";
import { HomePagePromoConfig } from "../widgets/znode-widgets/home-page-promo/HomePagePromoConfig";

export const addOrOverrideComponents: IComponents = {
    Text: TextConfig,
    HomePagePromo: HomePagePromoConfig,
};
