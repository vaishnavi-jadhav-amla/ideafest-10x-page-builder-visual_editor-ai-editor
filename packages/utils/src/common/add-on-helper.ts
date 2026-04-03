import { IBaseAttribute } from "@znode/types/attribute";
import { PRODUCT, INVENTORY } from "@znode/constants/product";
import { getAttributeValue } from "./attribute-helper";
import { IProductAddOn, IProductAddOnValues } from "@znode/types/product";

// Get selected AddOns based on SKU string
export function getSelectedAddOns(addOnSKU: string): string[] {
  return addOnSKU?.split(",") ?? [];
}

// Get maximum quantity from model attributes
export function getMaxQuantity(attributes: IBaseAttribute[] | undefined){
  const maxQuantity = getAttributeValue(attributes ?? [], PRODUCT.MAXIMUM_QUANTITY, "attributeValues");
  return maxQuantity ?? 0;
}

// Get the AddOn value by SKU
export function getAddOnValue(addOns: IProductAddOn[], sku: string): IProductAddOnValues | null {
  const addOn = addOns?.find((x) => x?.addOnValues?.some((y) => y.sku === sku));
  return addOn?.addOnValues?.find((val) => val.sku === sku) ?? null;
}

// Get the selected quantity, ensuring it's at least the model's minimum quantity
export function getSelectedQuantity(requestedQuantity: number, minimumQuantity: number | undefined): number {
  return Math.max(requestedQuantity, minimumQuantity ?? 0);
}

// Get the combined quantity (cart quantity is assumed to be 0 in this case)
export function getCombinedQuantity(selectedQuantity: number): number {
  const cartQuantity = 0; // Assuming cart quantity is 0
  return selectedQuantity + cartQuantity;
}

// Get inventory setting code from the AddOn value attributes
export function getInventorySettingCode(attributes: IBaseAttribute[]): string | undefined {
  return attributes?.find((attr) => attr.attributeCode === INVENTORY.TEXT_OUT_OF_STOCK_ADDON)?.selectValues?.[0]?.code;
}

// Update inventory settings based on the inventorySettingCode
export function updateInventorySettings(referenceParameter: { TrackInventory: boolean }, inventorySettingCode: string | undefined) {
  let allowBackOrder = false;

  if (inventorySettingCode) {
    switch (inventorySettingCode) {
      case INVENTORY.DISABLE_PURCHASING:
        referenceParameter.TrackInventory = true; // Track inventory
        break;
      case INVENTORY.ALLOW_BACK_ORDERING:
        allowBackOrder = true; // Backorders allowed
        referenceParameter.TrackInventory = true; // Track inventory
        break;
      case INVENTORY.DONT_TRACK_INVENTORY:
        referenceParameter.TrackInventory = false; // Do not track inventory
        break;
      default:
        break;
    }
  }

  return { allowBackOrder, trackInventory: referenceParameter.TrackInventory };
}

// Check if the inventory setting is "DontTrackInventory"
export function isDontTrackInventory(inventorySettingCode: string | undefined): boolean {
  return inventorySettingCode === INVENTORY.DONT_TRACK_INVENTORY;
}

// Check if the selected quantity is valid
export function isValidQuantity(combinedQuantity: number, requestedQuantity: number, maxQuantity: number): boolean {
  return combinedQuantity >= requestedQuantity && combinedQuantity <= maxQuantity; // Validate quantity
}

// Check if the item is out of stock
export function isOutOfStock(addOnQuantity: number | undefined, combinedQuantity: number, allowBackOrder: boolean, trackInventory: boolean): boolean {
  return (addOnQuantity ?? 0) < combinedQuantity || (!addOnQuantity && !allowBackOrder && trackInventory) || (addOnQuantity == null && allowBackOrder && trackInventory);
}

export function addOnPrice(addOn: IProductAddOn[], addOnSKU: string): { total: number; isPriceAvailable: boolean } {
  let total = 0;
  let isPriceAvailable = true;

  if (addOnSKU) {
    for (const addOnId of addOnSKU.split(",")) {
      const addOnValue = addOn.flatMap((a) => a.addOnValues).find((x) => x && x.sku === addOnId);
      const addOnPriceValue = addOnValue?.salesPrice ?? addOnValue?.retailPrice;
      total += addOnPriceValue ? Number(addOnPriceValue) : 0;

      if (addOnValue?.salesPrice == null && addOnValue?.retailPrice == null) {
        isPriceAvailable = false;
      }
    }
  }

  return { total, isPriceAvailable };
}

export function getInventoryMessage(isCallForPricing: boolean): string {
  if (isCallForPricing) {
    return " ";
  }
  return INVENTORY.ERROR_ADD_ON_PRICE;
}
