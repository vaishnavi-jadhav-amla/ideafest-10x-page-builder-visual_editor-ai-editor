import { IAddToTemplateRequestModel, ITemplateCartItems } from "@znode/types/account/order-templates";
import { addToTemplate } from "./add-multiple-products";
import { getPortalDetails } from "../../portal";
import { AREA, errorStack, logServer } from "@znode/logger/server";

export async function updateTemplateItemQuantity(templateItem: ITemplateCartItems) {
  try {
    if (templateItem) {
      const portalDetail = await getPortalDetails();
      const item: IAddToTemplateRequestModel = {
        publishProductId: templateItem.publishProductId || 0,
        quantity: templateItem.quantity || 1,
        itemId: templateItem.itemId,
        productSKU: templateItem.sku,
        isExistingItem: templateItem.isExistingItem,
        hasValidationErrors: templateItem.hasValidationErrors,
      };
      const updatedTemplateItem = await addToTemplate(item, portalDetail);
      if (updatedTemplateItem) {
        updatedTemplateItem.itemId = templateItem.itemId;
      }
      return updatedTemplateItem;
    }
  } catch (error) {
    logServer.error(AREA.ORDER_TEMPLATES, errorStack(error));
    return {} as ITemplateCartItems;
  }
}
