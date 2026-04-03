import { validateSimpleProductBehavior } from "../../cart/mapper";

import { CLASSTYPE } from "@znode/constants/checkout";
import { ERROR_CODE } from "@znode/constants/error";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { IOrderTemplate, ITemplateCartItems } from "@znode/types/account";
import { ICartItemListResponse } from "@znode/types/cart";
import { convertCamelCase } from "@znode/utils/server";
import { CommerceCollections_itemListByClassType } from "packages/clients/src/znode-client/commerce/commerce-collections";

export async function getOrderTemplateItems(classNumber: string) {
  try {
    if (!classNumber) return handleGetOrderTemplateItemsFailure();
    const orderTemplateDetails = await CommerceCollections_itemListByClassType(CLASSTYPE.ORDER_TEMPLATE, classNumber);

    if (orderTemplateDetails) {
      const orderTemplateItemResponse = convertCamelCase(orderTemplateDetails);
      if (orderTemplateItemResponse && orderTemplateItemResponse.errorCode === ERROR_CODE.CART_ITEMS_ERROR_CODE) {
        return null;
      }
      const orderTemplate: IOrderTemplate = {
        className: orderTemplateItemResponse.className,
        itemList: mapOrderTemplateItems(orderTemplateItemResponse.itemList),
      };
      return orderTemplate;
    } else {
      return handleGetOrderTemplateItemsFailure();
    }
  } catch (error) {
    logServer.error(AREA.ORDER_TEMPLATES, errorStack(error));
    return getOrderTemplateItemsFailureResponse();
  }
}

export function handleGetOrderTemplateItemsFailure() {
  logServer.error(AREA.ORDER_TEMPLATES, "Failed to get order template items.");
  return getOrderTemplateItemsFailureResponse();
}

export function mapOrderTemplateItems(items: ICartItemListResponse[] | undefined): ITemplateCartItems[] | undefined {
  if (items?.length) {
    const orderTemplateItems: ITemplateCartItems[] = [];

    items.forEach((element) => {
      const item: ITemplateCartItems = {
        publishProductId: element.znodeProductId,
        quantity: element.quantity || 0,
        totalPrice: element.totalPrice || 0,
        itemPrice: element.itemPrice || 0,
        minimumQuantity: 0,
        maximumQuantity: 0,
        currencyCode: "",
        productId: 0,
        productLink: "",
        unitPrice: element.unitPrice || 0,
        extendedPrice: 0,
        minQuantity: 0,
        maxQuantity: 0,
        productName: element.productName ?? "",
        imagePath: element.productImagePath ?? "",
        sku: element.sku || "",
        cartDescription: "",
        itemId: element.itemId || "",
        hasValidationErrors: validateSimpleProductBehavior(element, element.productType || ""),
        isExistingItem: true,
      };
      orderTemplateItems.push(item);
    });

    return orderTemplateItems;
  }
  return undefined;
}

function getOrderTemplateItemsFailureResponse() {
  return {
    itemList: undefined,
    className: undefined,
  } as IOrderTemplate;
}
