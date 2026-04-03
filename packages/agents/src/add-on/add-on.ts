import { IProductDetails } from "@znode/types/product-details";
import {
  addOnPrice,
  getAddOnValue,
  getCombinedQuantity,
  getInventoryMessage,
  getInventorySettingCode,
  getMaxQuantity,
  getSelectedAddOns,
  getSelectedQuantity,
  isDontTrackInventory,
  isOutOfStock,
  isValidQuantity,
  updateInventorySettings,
} from  "@znode/utils/common";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { INVENTORY, PRODUCT_TYPE } from "@znode/constants/product";
import { IProductAddOn } from "@znode/types/product";

export async function checkAddOnInventory(product: IProductDetails, addOnSKU: string, quantity: number) {
  if (!product) return null;

  const selectedAddOns = getSelectedAddOns(addOnSKU);
  const maxQuantity = getMaxQuantity(product.attributes);

  // Initialize an inventory response object
  const inventoryResponse = {
    isInStock: true,
    inventoryMessage: "",
    allowBackOrder: false,
    trackInventory: false,
    showAddToCart: true,
  };

  if (selectedAddOns.length > 0) {
    for (const sku of selectedAddOns) {
      const addOnValue = getAddOnValue(product.addOns || [], sku);
      if (addOnValue) {
        const selectedQuantity = getSelectedQuantity(quantity, product.minimumQuantity);
        const combinedQuantity = getCombinedQuantity(selectedQuantity);

        const inventorySettingCode = getInventorySettingCode(addOnValue.attributes || []);
        const referenceParameter = { TrackInventory: false };

        const { allowBackOrder, trackInventory } = updateInventorySettings(referenceParameter, inventorySettingCode);
        inventoryResponse.allowBackOrder = allowBackOrder;
        inventoryResponse.trackInventory = trackInventory;

        if (isDontTrackInventory(inventorySettingCode)) {
          inventoryResponse.inventoryMessage = product.inStockMessage ?? "";
          continue;
        }

        if (!isValidQuantity(combinedQuantity, quantity, Number(maxQuantity))) {
          inventoryResponse.inventoryMessage = `${INVENTORY.WARNING_SELECTED_QUANTITY} ${quantity} exceeds max limit of ${maxQuantity}`;
          inventoryResponse.isInStock = false;
          inventoryResponse.showAddToCart = false;
          break;
        }

        if (isOutOfStock(addOnValue.quantity, combinedQuantity, allowBackOrder, trackInventory)) {
          inventoryResponse.inventoryMessage = INVENTORY.TEXT_OUT_OF_STOCK_ADDON;
          inventoryResponse.isInStock = false;
          inventoryResponse.showAddToCart = false;
          break; // Exit loop if out of stock
        }

        if (combinedQuantity > (addOnValue?.quantity ?? 0) && allowBackOrder && trackInventory) {
          inventoryResponse.inventoryMessage = product.backOrderMessage ? product.backOrderMessage : INVENTORY.TEXT_BACK_ORDER_MESSAGE;
          inventoryResponse.showAddToCart = true;
        }
      }
    }
  }

  // If everything checks out, set in stock message
  if (inventoryResponse.isInStock) {
    inventoryResponse.inventoryMessage = product.inStockMessage ?? INVENTORY.TEXT_IN_STOCK;
    inventoryResponse.showAddToCart = true;
  }

  return inventoryResponse;
}

export function getProductFinalPrice(product: IProductDetails, addOn: IProductAddOn[], quantity: number, addOnSKU: string) {
  const result: {
    productPrice: number | null;
    showAddToCart: boolean;
    inventoryMessage: string;
    isCallForPricing: boolean;
  } = {
    productPrice: null,
    showAddToCart: true,
    inventoryMessage: "",
    isCallForPricing: false,
  };

  try {
    const isDisplayVariantsOnGrid =
      product?.attributes?.filter((x) => x.attributeCode === INVENTORY.DISPLAY_VARIANTS_ON_GRID).at(0)?.attributeValues && product.isConfigurableProduct;

    //TODO use Attribute value method
    const isCallForPricing = String(product?.attributes?.filter((x) => x.attributeCode === "CallForPricing").at(0)?.attributeValues);
    result.isCallForPricing = isCallForPricing === "undefined" ? false : JSON.parse(isCallForPricing);

    if (!result.isCallForPricing) {
      result.productPrice = calculateBasePrice(product, quantity);

      if (addOn?.length > 0) {
        const { total, isPriceAvailable } = addOnPrice(addOn, addOnSKU);
        result.productPrice = total > 0 ? (result.productPrice ?? 0) + total : result.productPrice;

        if (!isPriceAvailable) {
          result.showAddToCart = false;
          result.inventoryMessage = getInventoryMessage(result.isCallForPricing);
        }
      }

      if ((result.productPrice == null || result.productPrice === undefined) && product.productType !== PRODUCT_TYPE.GROUPED_PRODUCT && !isDisplayVariantsOnGrid) {
        result.showAddToCart = false;
        result.inventoryMessage = getInventoryMessage(result.isCallForPricing);
      }
    } else {
      result.showAddToCart = false;
    }
  } catch (error) {
    logServer.error(AREA.ADD_ON, errorStack(error));
  }

  return result;
}

const calculateBasePrice = (product: IProductDetails, quantity: number): number | null => {
  if (product?.tierPriceList && product.tierPriceList.length > 0) {
    const tierPrice = product.tierPriceList.find((x) => quantity >= Number(x.minQuantity) && quantity < Number(x.maxQuantity));
    if (tierPrice) {
      return tierPrice.price ?? null;
    }
  }

  if (quantity > 0) {
    if (product.salesPrice != null) {
      return product.salesPrice * quantity;
    } else if ((product.promotionalPrice ?? 0) > 0) {
      return (product.promotionalPrice ?? 0) * quantity;
    }
  }

  return product.retailPrice != null ? product.retailPrice : null;
};
