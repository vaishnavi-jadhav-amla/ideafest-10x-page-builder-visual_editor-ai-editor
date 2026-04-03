import { IProductDetails, IPublishBundleProductsDetails } from "@znode/types/product-details";
import { getProductDetails, getProductFilters, getProductInventoryExpands } from "../../product";
import { convertCamelCase, ExpandCollection } from "@znode/utils/server";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { IAttributesDetails, IProductAddOn } from "@znode/types/product";
import { FilterTuple, Searches_productsBySKU } from "@znode/clients/v2";
import { PRODUCT, PRODUCT_TYPE } from "@znode/constants/product";
import { getAttributeValue, stringToBooleanV2 } from "@znode/utils/common";
import { getPersonalizedAttributes, isPersonalizedAttributesAvailable } from "../../../../agents/src/attributes/attributes";

export async function getProductDetailsBySKU(sku: string, portalId: number, localeId: number, catalogCode: string, localeCode: string, publishCatalogId?: number) {
  try {
    if (sku && publishCatalogId) {
      let product = {} as IProductDetails;
      if (portalId && localeId && publishCatalogId) {
        const filters = getProductFilters(portalId, localeId, publishCatalogId, undefined, "true");
        const expand: ExpandCollection = getProductInventoryExpands();
        const sort: { [key: string]: string } = {};
        sort["ProductName"] = "ASC";
        const publishProductResponse = convertCamelCase(
          (await Searches_productsBySKU(sku, catalogCode, localeCode, expand, filters as FilterTuple[], sort, undefined, undefined)) || {}
        );
        if (publishProductResponse?.publishProductId) {
          product = (await getProductDetails(Number(publishProductResponse.publishProductId))) || ({} as IProductDetails);
          const isCallForPricing =
            stringToBooleanV2(getAttributeValue(product.attributes, PRODUCT.CALL_FOR_PRICING, "attributeValues")) ||
            product?.promotions?.filter((x) => x.promotionType?.toLowerCase() == PRODUCT.CALL_FOR_PRICING.toLowerCase()).length !== 0
              ? true
              : false;
          const callForPricingMessage =
            (product?.promotions?.length ?? 0) > 0
              ? product.promotions!.find((x) => x.promotionType?.toLowerCase() === PRODUCT.CALL_FOR_PRICING.toLowerCase())?.promotionMessage || null
              : PRODUCT.CALL_FOR_PRICING_MESSAGE;
          const filteredProduct = {
            sku: product.sku,
            quantity: product.quantity,
            publishProductId: product.publishProductId,
            productType: product.productType,
            isObsolete: product && checkObsolete(product),
            isAddOnRequired: product && (await checkAddOnPersonalizationRequired(product)),
            isOutOfStock: checkOutOfStock(product),
            maxQuantity: product.attributes && product.attributes.find((val) => val.attributeCode == "MaximumQuantity")?.attributeValues,
            minQuantity: product.attributes && product.attributes.find((val) => val.attributeCode == "MinimumQuantity")?.attributeValues,
            isActive: product.isActive,
            isCallForPricing,
            callForPricingMessage,
            isDisablePurchasing: checkDisablePurchasing(product),
            hasPriceNotSet: !product.retailPrice && !product.salesPrice,
          };

          if (product?.publishBundleProducts && product.publishBundleProducts.length > 0) {
            const disabledPurchaseChildData: IPublishBundleProductsDetails[] | undefined = checkBundleProductDisablePurchasing(product);
            if (disabledPurchaseChildData && disabledPurchaseChildData.length > 0) {
              const childWithMinQuantity = disabledPurchaseChildData.reduce((acc: IPublishBundleProductsDetails, curr: IPublishBundleProductsDetails) => {
                const currQty = (curr.quantity || 0) / (curr.associatedQuantity || 1);
                const accQty = (acc.quantity || 0) / (acc.associatedQuantity || 1);
                return currQty < accQty ? curr : acc;
              });
              if (childWithMinQuantity && childWithMinQuantity?.associatedQuantity) {
                filteredProduct.quantity = (childWithMinQuantity?.quantity || 0) / childWithMinQuantity.associatedQuantity;
              }
            }
          }
          return filteredProduct;
        }
        return null;
      }
    }
  } catch (error) {
    logServer.error(
      AREA.PRODUCT,
      `The error occurred in the getProductDetailsBySKU() method with parameters sku:${sku}, portalId:${portalId}, localeId:${localeId}, catalogCode:${catalogCode}, localeCode:${localeCode}, publishCatalogId:${publishCatalogId} in the dynamic-form-template.ts file. ${errorStack(
        error
      )}`
    );
    return null;
  }
}

export function checkObsolete(product: IProductDetails) {
  if (product.productType === PRODUCT_TYPE.BUNDLE_PRODUCT) {
    const { publishBundleProducts } = product || {};
    return product.isObsolete || publishBundleProducts?.some((bundleProduct: IPublishBundleProductsDetails) => bundleProduct.isObsolete);
  }
  return product.isObsolete;
}

export function checkBundleProductDisablePurchasing(productData: IProductDetails) {
  const { publishBundleProducts } = productData;
  const disablePurchaseChildProduct =
    publishBundleProducts &&
    publishBundleProducts.filter(
      (bundleProduct: IPublishBundleProductsDetails) =>
        bundleProduct?.attributes &&
        bundleProduct.attributes.find((attributes: IAttributesDetails) => attributes.attributeCode == PRODUCT.OUT_OF_STOCK_OPTIONS)?.selectValues?.at(0)?.code ==
          PRODUCT.DISABLE_PURCHASING
    );
  return disablePurchaseChildProduct;
}

export function checkDisablePurchasing(productData: IProductDetails) {
  if (productData.productType === PRODUCT_TYPE.SIMPLE_PRODUCT) {
    const isPurchasingDisabled = checkSimpleProductDisablePurchasing(productData);
    return isPurchasingDisabled;
  } else if (productData.productType === PRODUCT_TYPE.BUNDLE_PRODUCT && productData?.publishBundleProducts && productData.publishBundleProducts.length > 0) {
    const disabledPurchaseChildData = checkBundleProductDisablePurchasing(productData);
    if (disabledPurchaseChildData && disabledPurchaseChildData.length > 0) {
      return true;
    }
    return false;
  } else {
    return false;
  }
}

export function checkSimpleProductDisablePurchasing(productData: IProductDetails) {
  const outOfStockOptions = productData.attributes && productData.attributes.find((val: IAttributesDetails) => val.attributeCode == PRODUCT.OUT_OF_STOCK_OPTIONS);
  const isDisablePurchasing = outOfStockOptions?.selectValues?.find((val: { code: string }) => val.code)?.code == PRODUCT.DISABLE_PURCHASING;
  return isDisablePurchasing;
}

export function checkOutOfStock(productData: IProductDetails) {
  if (productData?.publishBundleProducts && productData.publishBundleProducts.length > 0) {
    const disabledPurchaseChildData = checkBundleProductDisablePurchasing(productData);
    if (disabledPurchaseChildData && disabledPurchaseChildData.length > 0) {
      const childWithMinQuantity = disabledPurchaseChildData.reduce((acc: IPublishBundleProductsDetails, curr: IPublishBundleProductsDetails) => {
        const currQty = curr.quantity || 0 / (curr.associatedQuantity || 1);
        const accQty = acc.quantity || 0 / (acc.associatedQuantity || 1);
        return currQty < accQty ? curr : acc;
      });
      if (childWithMinQuantity && childWithMinQuantity?.associatedQuantity) {
        const minOrderBundleQty = (childWithMinQuantity.quantity || 0) / childWithMinQuantity.associatedQuantity;
        return minOrderBundleQty < 1;
      }
    }
    return false;
  } else {
    const isPurchasingDisabled = checkSimpleProductDisablePurchasing(productData);
    const productQty = productData.quantity;
    if (isPurchasingDisabled && productQty == 0) {
      return true;
    } else {
      return false;
    }
  }
}

export async function checkAddOnPersonalizationRequired(productData: IProductDetails) {
  const addOns = productData.addOns;
  const personalization =
    productData.attributes && productData.attributes.filter((attribute: IAttributesDetails) => attribute.attributeTypeName === "Text" && attribute?.isPersonalizable);
  let attributeData;
  if (isPersonalizedAttributesAvailable(productData.attributes ?? [])) {
    attributeData = (await getPersonalizedAttributes(productData.attributes ?? [], productData.publishProductId)) || [];
  }
  const personalizeList = attributeData?.filter((item) => item.isPersonalizable);
  const isPersonalizeRequired = personalizeList?.some((item) => item.isRequired);

  if (!addOns && !personalization) {
    return false;
  }
  if (addOns?.some((addOn: IProductAddOn) => addOn.isRequired) || isPersonalizeRequired) {
    return true;
  } else {
    return false;
  }
}
