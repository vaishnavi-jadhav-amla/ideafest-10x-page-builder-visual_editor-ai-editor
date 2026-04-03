import { IOrderTemplate, ITemplateCartItems } from "@znode/types/account/order-templates";
import { getOrderTemplateItems } from "./get-items";

export async function isOrderTemplateItemsModified(updatedTemplateModel: ITemplateCartItems[], classNumber: string) {
  let isDataModified = true;
  const existingTemplateModel: IOrderTemplate = await getOrderTemplateItems(classNumber);

  const existingTemplateItemCount = existingTemplateModel.itemList?.length || 0;

  if (!(updatedTemplateModel?.length > existingTemplateItemCount)) {
    isDataModified =
      existingTemplateModel?.itemList?.some((existingItem) => {
        const templateItem = updatedTemplateModel.find((modifiedItem) => modifiedItem.sku === existingItem.sku);
        return templateItem !== undefined && templateItem.quantity !== existingItem.quantity;
      }) ?? false;
  }
  return isDataModified;
}
