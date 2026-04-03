import { IQuickOrder, IQuickOrderCart, IQuickOrderParameter, IQuickOrderProduct, IQuickOrderProductListResponse } from "@znode/types/quick-order";
import { QUICK_ORDER } from "@znode/constants/quick-order";
import { convertCamelCase } from "@znode/utils/server";
import { PublishProducts_validateProduct } from "@znode/clients/v2";
import { PRODUCT_TYPE } from "@znode/constants/product";

export async function addProductsToQuickOrderUsingExcel(quickOrderCartModel: IQuickOrderCart[], storeCode: string, localeCode: string, catalogCode: string) {
  quickOrderCartModel = validatequickOrderItemsQuantity(quickOrderCartModel);
  const quickOrderModel: IQuickOrder = await validateProductSKUs(quickOrderCartModel, storeCode, localeCode, catalogCode);
  if (quickOrderModel.productDetail.length > QUICK_ORDER.QUICK_ORDER_PAD_ROWS_LIMIT) {
    quickOrderModel.productDetail = quickOrderModel.productDetail.slice(0, -(quickOrderModel.productDetail.length - QUICK_ORDER.QUICK_ORDER_PAD_ROWS_LIMIT));
    quickOrderModel.validSKUCount = QUICK_ORDER.QUICK_ORDER_PAD_ROWS_LIMIT;
    return quickOrderModel;
  }
  return quickOrderModel;
}

/**
 * This method Validate the Quick Order template item Quantity
 * @param quickOrderCartModel
 * @returns IQuickOrderCart[]
 */
export function validatequickOrderItemsQuantity(quickOrderCartModel: IQuickOrderCart[]) {
  if (quickOrderCartModel.length > 0) {
    const quickOrderCartModelMap = new Map();
    quickOrderCartModel.forEach((item: IQuickOrderCart) => {
      let updatedQuantity = quickOrderCartModelMap.get(item.sku) || 0;
      if (!(typeof item.quantity === "number" && Number.isInteger(item.quantity))) {
        updatedQuantity += 1;
      } else {
        updatedQuantity += item.quantity;
      }
      quickOrderCartModelMap.set(item.sku, updatedQuantity);
    });
    const updatedQuickOrderCartModel: IQuickOrderCart[] = [];
    for (const [key, value] of quickOrderCartModelMap) {
      updatedQuickOrderCartModel.push({ sku: key, quantity: value });
    }
    return updatedQuickOrderCartModel;
  }
  return quickOrderCartModel;
}

/**
 *This method is to validate sku against catalog and get details
 * @param quickOrderCartModel
 * @returns IQuickOrder
 */

export async function validateProductSKUs(quickOrderCartModel: IQuickOrderCart[], storeCode: string, localeCode: string, catalogCode: string) {
  const quickOrderModel: IQuickOrder = {
    productDetail: [],
    productSKUText: "",
    validSKUCount: 0,
    invalidSKUCount: 0,
    isSuccess: false,
    invalidSKUs: [],
    invalidSKUsWithQuantity: [],
    validSKUs: [],
  };
  if (quickOrderCartModel.length > 0) {
    const skuString = quickOrderCartModel.map((item) => item.sku.trim()).join(",");
    const quickOrderParameterModel: IQuickOrderParameter = { skus: skuString };
    const quickOrderProductListResponse: IQuickOrderProductListResponse = convertCamelCase(
      (await PublishProducts_validateProduct(catalogCode, storeCode, localeCode, quickOrderParameterModel)) || {}
    );
    quickOrderProductListResponse?.products.forEach((item: IQuickOrderProduct) => {
      item.isObsolete = !!item.isObsolete;
      const cloneItem = Object.assign({}, item);
      cloneItem.inputQuantity = 0;

      if (
        item.isvalidSku &&
        !item.isObsolete &&
        item.productType != PRODUCT_TYPE.CONFIGURABLE_PRODUCT &&
        !item.isAddOnRequired &&
        !item.isPersonalizable &&
        quickOrderModel.validSKUs.length < QUICK_ORDER.QUICK_ORDER_PAD_ROWS_LIMIT
      ) {
        quickOrderCartModel.forEach((element: IQuickOrderCart) => {
          if (element.sku == cloneItem.sku) {
            cloneItem.inputQuantity += Number(element.quantity);
          }
        });
        quickOrderModel.validSKUs.push(cloneItem.sku);
        quickOrderModel.productDetail.push({ ...cloneItem, publishProductId: cloneItem.id });
      } else {
        quickOrderCartModel.forEach((element: IQuickOrderCart) => {
          if (element.sku == cloneItem.sku) {
            cloneItem.inputQuantity = element.quantity;
            quickOrderModel.invalidSKUs.push(cloneItem.sku);
            quickOrderModel.invalidSKUsWithQuantity?.push({ quantity: cloneItem.inputQuantity, sku: cloneItem.sku });
          }
        });
      }
    });
    quickOrderModel.validSKUCount = quickOrderModel.productDetail.length;
    quickOrderModel.invalidSKUCount = quickOrderCartModel.length - quickOrderModel.validSKUCount;
    quickOrderModel.isSuccess = true;
  } else {
    quickOrderModel.isSuccess = false;
  }
  return quickOrderModel;
}
