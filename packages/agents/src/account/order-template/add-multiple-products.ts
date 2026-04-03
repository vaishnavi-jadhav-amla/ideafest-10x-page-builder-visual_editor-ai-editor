import { IAddToTemplateRequestModel, ITemplateCartItems } from "@znode/types/account";
import { getPortalDetails } from "../../portal";
import { IPortalDetail } from "@znode/types/portal";
import { IBundleProductsOutOfStockOption, IProductDetails, IPublishBundleProductsDetails } from "@znode/types/product-details";
import { getProductDetails } from "../../product";
import { INVENTORY, PRODUCT, PRODUCT_TYPE } from "@znode/constants/product";
import { getProductDetailsBySKU } from "../../quick-order/dynamic-form-template";
import { ATTRIBUTE } from "@znode/constants/attribute";
import { uuidv4 } from "@znode/utils/component";
import { PAYMENT } from "@znode/constants/payment";

export async function addMultipleProductsToOrderTemplate(items: IAddToTemplateRequestModel[]) {
  const cartItems = consolidateProductData(items);
  const portalDetail: IPortalDetail = await getPortalDetails();
  const promises = cartItems.map((item: IAddToTemplateRequestModel) => addToTemplate(item, portalDetail));
  const templateItemList = await Promise.all(promises);
  const filteredTemplateItemList = templateItemList.filter((item): item is ITemplateCartItems => item !== undefined && item !== null);
  return filteredTemplateItemList;
}

export async function addToTemplate(item: IAddToTemplateRequestModel, portalData: IPortalDetail) {
  const isValidProductDetails = item?.publishProductId > 0 || (item?.productSKU.trim() !== "" && item?.productSKU != null && item?.productSKU !== undefined) ? true : false;
  if ((isValidProductDetails || item.hasValidationErrors) && portalData.publishCatalogId) {
    const productQuantity = item?.quantity ? item.quantity : 1;
    let product;
    if (!item.hasValidationErrors) {
      if (item?.publishProductId) {
        product = (await getProductDetails(item.publishProductId)) as IProductDetails;
      } else {
        product = await getPublishProductBySKU(item?.productSKU, portalData.publishCatalogId, portalData);
      }
    }
    if (product || item.hasValidationErrors) {
      const templateItem = setProductDetails(product as IProductDetails, productQuantity, portalData, item);
      return templateItem;
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setProductDetails(product: IProductDetails | any, productQuantity: number, portalData: IPortalDetail, templateItem?: IAddToTemplateRequestModel) {
  const templateCartItem: ITemplateCartItems = {} as ITemplateCartItems;
  if (templateItem?.hasValidationErrors) {
    return setDetailsForInvalidProducts(templateCartItem, templateItem, portalData);
  } else {
    //To set unit price of Product
    setProductPrice(product, productQuantity);
    if (product?.publishProductId) {
      templateCartItem.publishProductId = product.publishProductId;
      templateCartItem.productId = product?.configurableProductId ? product.configurableProductId : product?.publishProductId;
      templateCartItem.quantity = productQuantity;
      templateCartItem.unitPrice = product.productPrice || 0;
      templateCartItem.extendedPrice = product?.productPrice ? product.productPrice * productQuantity : 0;
      templateCartItem.productName = product.name || "";
      templateCartItem.imagePath = product.imageSmallPath || "";
      templateCartItem.sku = product.sku ?? "";
      templateCartItem.itemId = templateItem?.itemId || uuidv4();
      templateCartItem.isExistingItem = templateItem?.isExistingItem || false;
      templateCartItem.currencyCode = portalData.currencyCode ?? PAYMENT.UNITED_STATES_SUFFIX;
      setProductInventoryDetails(product, templateCartItem);
      templateCartItem.isCallForPricing = checkIsCallForPricing(product);
      templateCartItem.callForPricingMessage = templateCartItem.isCallForPricing ? getCallForPricingMessage(product) : "";
      templateCartItem.minQuantity = product.minimumQuantity || 1;
      templateCartItem.maxQuantity = product.maximumQuantity || 1;
      templateCartItem.isActive = product.isActive;
      templateCartItem.isObsolete = isProductObsolete(product);
      templateCartItem.productType = product.productType;
      templateCartItem.productLink = product.seoUrl ? "/" + encodeURIComponent(product.seoUrl) : `/product/${product.publishProductId}`;
      templateCartItem.hasValidationErrors = false;
    }
  }
  return templateCartItem;
}

export function setDetailsForInvalidProducts(templateCartItem: ITemplateCartItems, templateItem: IAddToTemplateRequestModel, portalData: IPortalDetail) {
  if (templateItem) {
    templateCartItem.hasValidationErrors = templateItem.hasValidationErrors;
    templateCartItem.extendedPrice = templateItem.totalPrice || 0;
    templateCartItem.unitPrice = templateItem.unitPrice || 0;
    templateCartItem.productName = templateItem.productName || "";
    templateCartItem.isExistingItem = templateItem.isExistingItem;
    templateCartItem.currencyCode = portalData.currencyCode ?? PAYMENT.UNITED_STATES_SUFFIX;
    templateCartItem.imagePath = templateItem.imagePath || "";
    templateCartItem.itemId = templateItem.itemId;
    templateCartItem.quantity = templateItem.quantity;
  }
  return templateCartItem;
}

export function setProductInventoryDetails(product: IProductDetails, templateCartItem: ITemplateCartItems) {
  if (product && product.publishProductId) {
    if (product.productType === PRODUCT_TYPE.SIMPLE_PRODUCT) {
      const outOfStockOption = product.attributes
        ?.filter((x) => x.attributeCode === PRODUCT.OUT_OF_STOCK_OPTIONS)
        .at(0)
        ?.selectValues?.at(0)?.code;
      templateCartItem.defaultInventoryCount = String(product.quantity);
      templateCartItem.isDisablePurchasing = outOfStockOption === PRODUCT.DISABLE_PURCHASING ? true : false;
      templateCartItem.allowBackOrder = outOfStockOption === INVENTORY.ALLOW_BACK_ORDERING ? true : false;
      templateCartItem.isDontTrackInventory = outOfStockOption === INVENTORY.DONT_TRACK_INVENTORY ? true : false;
    } else if (product.productType === PRODUCT_TYPE.BUNDLE_PRODUCT) {
      setBundleProductInventoryDetails(product, templateCartItem);
      templateCartItem.cartDescription = getBundleProductDescription(product);
    }

    // Temporary workaround for the "Allow Back Ordering" issue.
    // This code overrides the allowBackOrder flag to prevent back ordering
    // and ensures inventory tracking is disabled.
    // TODO: Remove this code once the "Allow Back Ordering" issue is resolved.
    if (templateCartItem.allowBackOrder) {
      templateCartItem.allowBackOrder = false;
      templateCartItem.isDontTrackInventory = true;
    }
  }
}

export function setBundleProductInventoryDetails(product: IProductDetails, templateCartItem: ITemplateCartItems) {
  if (product.publishBundleProducts?.length) {
    let lowestInventoryProduct;
    const outOfStockOptionArray = getOutOfStockOptionForBundleProduct(product.publishBundleProducts);
    templateCartItem.isDontTrackInventory = isAllProductDontTrackInventory(outOfStockOptionArray);
    if (!templateCartItem.isDontTrackInventory) {
      lowestInventoryProduct = findMinInventoryOption(outOfStockOptionArray);
    }

    if (lowestInventoryProduct) {
      templateCartItem.allowBackOrder = !templateCartItem.isDontTrackInventory ? true : lowestInventoryProduct.outOfStockOptions === INVENTORY.ALLOW_BACK_ORDERING ? true : false;
      templateCartItem.isDontTrackInventory = templateCartItem.isDontTrackInventory ? true : lowestInventoryProduct.outOfStockOptions === PRODUCT.DISABLE_PURCHASING ? false : true;

      templateCartItem.defaultInventoryCount = String(Math.floor(lowestInventoryProduct.defaultInventoryCount / lowestInventoryProduct.associatedQuantity) || 0);
    }
  }
}
export function getOutOfStockOptionForBundleProduct(bundleProducts: IPublishBundleProductsDetails[]) {
  const outOfStockOptionArray: IBundleProductsOutOfStockOption[] = [];
  if (bundleProducts?.length) {
    bundleProducts.forEach((product: IPublishBundleProductsDetails) => {
      const outOfStockOption =
        product.attributes
          ?.filter((x) => x.attributeCode === PRODUCT.OUT_OF_STOCK_OPTIONS)
          .at(0)
          ?.selectValues?.at(0)?.code || "";
      const outOfStockOptionDetails: IBundleProductsOutOfStockOption = {
        sku: product.sku || "",
        outOfStockOptions: outOfStockOption,
        defaultInventoryCount: Number(product.quantity) || 0,
        associatedQuantity: product.associatedQuantity || 1,
      };
      outOfStockOptionArray.push(outOfStockOptionDetails);
    });
  }
  return outOfStockOptionArray;
}

export function setProductPrice(product: IProductDetails, productQuantity?: number) {
  const isDisplayVariantsOnGrid =
    product?.attributes?.filter((x) => x.attributeCode === INVENTORY.DISPLAY_VARIANTS_ON_GRID).at(0)?.attributeValues && product.isConfigurableProduct;

  const isCallForPricing = String(product?.attributes?.filter((x) => x.attributeCode === "CallForPricing").at(0)?.attributeValues);
  product.isCallForPricing = isCallForPricing === "undefined" ? false : JSON.parse(isCallForPricing);

  if (product.isCallForPricing === false) {
    const inputQuantity = productQuantity ? productQuantity : 1;
    // Apply tier price if any.
    if ((product?.tierPriceList?.length ?? 0) > 0 && product?.tierPriceList?.some((x) => inputQuantity >= Number(x.minQuantity))) {
      product.productPrice = product?.tierPriceList?.find((x) => inputQuantity >= Number(x.minQuantity) && inputQuantity < Number(x.maxQuantity))?.price ?? 0;
    } else {
      if (productQuantity) {
        product.productPrice = product.promotionalPrice ? product.promotionalPrice : product?.salesPrice ? product?.salesPrice : product?.retailPrice ?? 0;
      }
    }
    if ((product.productPrice == null || product.productPrice === undefined) && product.productType !== PRODUCT_TYPE.GROUPED_PRODUCT && !isDisplayVariantsOnGrid) {
      product.showAddToCart = false;
      product.inventoryMessage = isCallForPricing ? " " : INVENTORY.ERROR_PRICE_NOT_ASSOCIATE;
    }
  } else product.showAddToCart = false;
}

export function checkIsCallForPricing(product: IProductDetails) {
  const isCallForPricing = String(product?.attributes?.filter((x) => x.attributeCode === "CallForPricing").at(0)?.attributeValues);
  const result = isCallForPricing === "undefined" ? false : JSON.parse(isCallForPricing);
  return result;
}

export function getCallForPricingMessage(product: IProductDetails) {
  const callForPricingMessage = product.promotions?.filter((x) => x.promotionType?.toLowerCase() === PRODUCT.CALL_FOR_PRICING_MESSAGE.toLowerCase()).at(0)?.promotionMessage;
  return callForPricingMessage;
}

export async function getPublishProductBySKU(productSKU: string, catalogId: number, portalData: IPortalDetail) {
  let productDetails = await getProductDetailsBySKU(productSKU, portalData.portalId, portalData.localeId, portalData.catalogCode || "", portalData.localeCode || "", catalogId);
  if (productDetails?.publishProductId) {
    //To get Inventory Details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    productDetails = (await getProductDetails(productDetails?.publishProductId)) as any;
  }

  return productDetails;
}

function consolidateProductData(requestModel: IAddToTemplateRequestModel[]): IAddToTemplateRequestModel[] {
  const mergedModel: { [key: string]: IAddToTemplateRequestModel } = {};

  requestModel.forEach((item) => {
    const existingItem = mergedModel[item.productSKU];
    if (existingItem) {
      existingItem.quantity += item.quantity;
      existingItem.publishProductId = item.publishProductId || existingItem.publishProductId;
      existingItem.itemId = item.itemId || existingItem.itemId;
      existingItem.isExistingItem = item.isExistingItem || existingItem.isExistingItem;
    } else {
      mergedModel[item.productSKU] = { ...item };
    }
  });

  return Object.values(mergedModel);
}

export function isAllProductDontTrackInventory(outOfStockOptionArray: IBundleProductsOutOfStockOption[]) {
  return outOfStockOptionArray?.every((option) => option.outOfStockOptions === INVENTORY.DONT_TRACK_INVENTORY) || false;
}

function findMinInventoryOption(bundleProductsOutOfStockOptionArray: IBundleProductsOutOfStockOption[]): IBundleProductsOutOfStockOption | undefined {
  const disabledPurchaseChildData = bundleProductsOutOfStockOptionArray.filter((product) => product.outOfStockOptions !== INVENTORY.DONT_TRACK_INVENTORY);

  const childWithMinQuantity = disabledPurchaseChildData.reduce((acc: IBundleProductsOutOfStockOption, curr: IBundleProductsOutOfStockOption) => {
    const currQty = curr.defaultInventoryCount / curr.associatedQuantity;
    const accQty = acc.defaultInventoryCount / acc.associatedQuantity;
    return currQty < accQty ? curr : acc;
  });

  return childWithMinQuantity;
}

export function getBundleProductDescription(product: IProductDetails) {
  let productDescription = "";
  if (product && product.productType === PRODUCT_TYPE.BUNDLE_PRODUCT) {
    const bundleProductList = product.publishBundleProducts;
    if (bundleProductList?.length) {
      bundleProductList.forEach((product) => {
        productDescription += `${product.sku} - ${product.name} <br/>`;
      });
    }
  }
  return productDescription;
}

export function isProductObsolete(product: IProductDetails) {
  if (product.productType === PRODUCT_TYPE.SIMPLE_PRODUCT) {
    return product.isObsolete;
  } else if (product.productType === PRODUCT_TYPE.BUNDLE_PRODUCT) {
    let isObsolete = product.isObsolete;
    if (!isObsolete && product.publishBundleProducts) {
      isObsolete = isAnyBundleProductObsolete(product.publishBundleProducts);
    }
    return isObsolete;
  }
}

export function isAnyBundleProductObsolete(publishBundleProducts?: IPublishBundleProductsDetails[]) {
  return publishBundleProducts?.some((product) => product?.attributes?.find((a) => a.attributeCode === PRODUCT.IS_OBSOLETE)?.attributeValues === ATTRIBUTE.TRUE_VALUE);
}
