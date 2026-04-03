import { AREA, errorStack, logServer } from "@znode/logger/server";
import { ExpandCollection, FilterCollection, FilterKeys, FilterOperators, convertCamelCase, generateTagName } from "@znode/utils/server";
import { FilterTuple, PublishProducts_configurableProductsByParentProductSKU } from "@znode/clients/v2";
import { IAttributeDetails, IBaseAttribute } from "@znode/types/attribute";
import { IAttributesDetails, IParameterProduct, IPromotion, IQuery } from "@znode/types/product";
import { IConfigurableAttribute, IProductDetails } from "@znode/types/product-details";
import { INVENTORY, PRODUCT } from "@znode/constants/product";
import { ParameterProductModel, PublishProduct_getProductAttribute, PublishProduct_getPublishProductBySKU } from "@znode/clients/v1";
import { checkAddOnInventory, getProductFinalPrice } from "../add-on/add-on";
import { getAttributeValue, getSavedUserSession, stringToBooleanV2 } from "@znode/utils/common";
import { getHighlightListFromAttributes, getProductExpands } from "../product";

import { CACHE_KEYS } from "@znode/constants/cache-keys";
import { COMMON } from "@znode/constants/common";
import { IPortalDetail } from "@znode/types/portal";
import { IUser } from "@znode/types/user";
import { getCatalogCode } from "../category";
import { getUserCatalogId } from "../user";

export async function getConfigurableProduct(searchParams: IQuery, portalData: IPortalDetail, userSession: IUser) {
  try {
    const parentProductId = Number(searchParams?.parentProductId);
    if (parentProductId > 0) {
      const selectedAttributesList = getAttributeValues(searchParams.selectedCodes ?? "", searchParams.selectedValues ?? "");
      const selectedVariantData = createVariantData(selectedAttributesList, searchParams, portalData);
      const expand: ExpandCollection = await getProductExpands();
      const cacheInvalidator = new FilterCollection();
      const catalogCode = await getCatalogCode(portalData, userSession);
      cacheInvalidator.add(
        FilterKeys.CacheTags,
        FilterOperators.Contains,
        generateTagName(
          `${CACHE_KEYS.CATALOG}, ${CACHE_KEYS.PUBLISH_PRODUCT}, ${CACHE_KEYS.DYNAMIC_TAG}`,
          catalogCode || "",
          String(parentProductId),
          "ConfigurableProductsByParentProductSKU"
        )
      );
      const publishProductModel = await PublishProducts_configurableProductsByParentProductSKU(
        selectedVariantData.parentProductSku,
        catalogCode as string,
        portalData.storeCode as string,
        portalData.localeCode,
        selectedVariantData.selectedAttributes,
        expand,
        cacheInvalidator.filterTupleArray as FilterTuple[]
      );
      const productDetails = convertCamelCase(publishProductModel);
      const isCallForPricingPromotion = productDetails?.promotions?.some((x: IPromotion) => x.promotionType?.toLowerCase() === PRODUCT.CALL_FOR_PRICING_MESSAGE.toLowerCase());
      productDetails.isCallForPricingPromotion = isCallForPricingPromotion;
      const isAllWarehousesStock = portalData?.globalAttributes?.find(
        (a: IAttributeDetails) => a.attributeCode?.toLowerCase() === PRODUCT.DISPLAY_ALL_WAREHOUSES_STOCK.toLowerCase()
      )?.attributeValue;
      productDetails.displayAllWarehousesStock = isAllWarehousesStock || false;
      const isLoginToSeePricing = portalData?.globalAttributes?.find(
        (a) => a.attributeCode?.toLowerCase() === PRODUCT.LOGIN_TO_SEE_PRICING_AND_INVENTORY.toLowerCase()
      )?.attributeValue;
      if (selectedVariantData && publishProductModel) {
        const variantData = createConfigurableParameterModel(selectedVariantData);
        let configurableData: IConfigurableAttribute | undefined = {};
        configurableData = await getConfigurableProductInfo(parentProductId, variantData, portalData, userSession);
        if (productDetails && (productDetails.hasError || productDetails.isDefaultConfigurableProduct) && configurableData) {
          configurableData.combinationErrorMessage = PRODUCT.PRODUCT_COMBINATION_ERROR_MESSAGE;
        }
        productDetails.isLoginToSeePricing = stringToBooleanV2(isLoginToSeePricing);
        if (configurableData) {
          const productInformation = await mapConfigurableProductData(
            parentProductId,
            productDetails.hasError ? searchParams.parentProductSKU : String(productDetails?.sku),
            productDetails.hasError ? {} : productDetails,
            configurableData,
            portalData,
            productDetails?.hasError ? true : false,
            userSession
          );
          productInformation.isLoginToSeePricing = stringToBooleanV2(isLoginToSeePricing);
          return productInformation;
        }
        return productDetails;
      }
    }
    return null;
  } catch (error) {
    logServer.error(AREA.CONFIGURABLE_PRODUCT, errorStack(error));
    return null;
  }
}

export function getAttributeValues(codes: string, values: string): { [key: string]: string } {
  const codesArray: string[] = codes.split(",");
  const valuesArray: string[] = values.split("|");
  const selectedAttributes: { [key: string]: string } = {};

  for (let i = 0; i < codesArray.length; i++) {
    const key: string = codesArray[i]?.trim() ?? "";
    const value: string = valuesArray[i]?.trim() ?? "";

    selectedAttributes[key] = value;
  }

  return selectedAttributes;
}

export function createVariantData(selectedAttributesList: { [key: string]: string }, searchParams: IQuery, portalData: IPortalDetail) {
  return {
    selectedAttributes: selectedAttributesList,
    localeId: portalData.localeId,
    portalId: portalData.portalId,
    publishCatalogId: portalData.publishCatalogId,
    parentProductId: searchParams.parentProductId,
    selectedCode: searchParams.codes,
    selectedValue: searchParams.values,
    parentProductSku: searchParams.parentProductSKU,
  };
}

export function createConfigurableParameterModel(queryData: IParameterProduct) {
  return {
    parentProductId: queryData.parentProductId,
    localeId: queryData.localeId,
    selectedAttributes: queryData.selectedAttributes,
    portalId: queryData.portalId,
    selectedCode: queryData.selectedCode,
    selectedValue: queryData.selectedValue,
  };
}

export async function getConfigurableProductInfo(productId: number, selectedVariant: IParameterProduct, portalData: IPortalDetail, userSession: IUser) {
  const configurableData: IConfigurableAttribute = {};
  let attributeDetails: IAttributesDetails[] = [];
  if (productId > 0) {
    const currentUser = userSession ? userSession : await getSavedUserSession();
    const catalogId = await getUserCatalogId(
      portalData?.publishCatalogId,
      portalData?.portalProfileCatalogId,
      portalData?.profileId,
      portalData?.portalFeatureValues,
      currentUser as IUser
    );
    selectedVariant.publishCatalogId = catalogId;
    const attributes = await PublishProduct_getProductAttribute(productId, selectedVariant as ParameterProductModel);
    const attributesList = convertCamelCase(attributes.Attributes);
    let attributeAvailability: { [key: string]: string } | undefined = {};
    attributeAvailability = selectedVariant.selectedAttributes;
    const previousSelections: { [key: string]: string | undefined } = {};
    if (attributes && attributesList && attributesList.length > 0) {
      attributeDetails = attributesList;
      attributeDetails.forEach((attribute: IAttributesDetails) => {
        if (selectedVariant.selectedCode && selectedVariant.selectedCode.toLowerCase() === attribute.attributeCode && attribute.attributeCode.toLowerCase()) {
          previousSelections[attribute.attributeCode] = selectedVariant.selectedValue;
          attribute.configurableAttribute && attribute.configurableAttribute.forEach((attr) => (attr.isDisabled = false));
          // eslint-disable-next-line no-prototype-builtins
        } else if (attributeAvailability && attribute.attributeCode && attributeAvailability.hasOwnProperty(attribute.attributeCode as string)) {
          const selectedValue = attributeAvailability[attribute.attributeCode];
          const attributeCodeParts = attribute.attributeCode.split("-");
          const firstPart = attributeCodeParts?.[0]?.toLowerCase();
          const selectedCode = selectedVariant?.selectedCode?.toLowerCase();
          if (attributeCodeParts && attributeCodeParts.length > 0 && selectedValue && firstPart && selectedCode && firstPart !== selectedCode && attribute.attributeCode) {
            previousSelections[attribute.attributeCode] = selectedValue;
          } else {
            previousSelections[attribute.attributeCode] =
              (attributes && attributesList?.find((x: IAttributesDetails) => x.attributeCode === attribute.attributeCode)?.selectValues[0]?.code) || "";
          }
        }
      });

      configurableData.configurableAttributes = attributeDetails;

      for (const configurableAttribute of attributeDetails) {
        const selectedValue = attributeAvailability && attributeAvailability[String(configurableAttribute.attributeCode)];
        if (selectedValue !== undefined && selectedValue !== null) {
          configurableAttribute.selectedAttributeValue = [selectedValue];
        }
      }
      return configurableData;
    }
  }
  return configurableData;
}

function getRequiredFilters(portalData: IPortalDetail, catalogId?: number) {
  const filters: FilterCollection = new FilterCollection();
  if (catalogId) {
    filters.add(FilterKeys.ZnodeCatalogId, FilterOperators.Equals, catalogId?.toString() || "");
  } else {
    filters.add(FilterKeys.ZnodeCatalogId, FilterOperators.Equals, portalData?.publishCatalogId?.toString() || "");
  }
  filters.add(FilterKeys.LocaleId, FilterOperators.Equals, portalData.localeId.toString());
  filters.add(FilterKeys.PortalId, FilterOperators.Equals, portalData.portalId.toString());
  filters.add(FilterKeys.IsActive, FilterOperators.Equals, COMMON.TRUE_VALUE);
  return filters.filterTupleArray;
}

export async function mapConfigurableProductData(
  productId: number,
  sku: string,
  model: IProductDetails,
  configurableData: IConfigurableAttribute,
  portalData: IPortalDetail,
  hasError: boolean,
  userSession?: IUser
) {
  if (configurableData?.configurableAttributes?.length) {
    configurableData.configurableAttributes.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    for (const attribute of configurableData.configurableAttributes) {
      if (attribute.selectValues?.length) {
        attribute.selectValues.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      }
    }
  }
  const productType = getAttributeValue(model?.attributes as IAttributeDetails[], PRODUCT.PRODUCT_TYPE, "selectValues");
  const minQuantity = Number(getAttributeValue(model?.attributes as IAttributeDetails[], PRODUCT.MINIMUM_QUANTITY, "attributeValues"));
  model.configurableData = configurableData;
  let productInformation: IProductDetails | null = null;
  let addOnSKU = "";
  const addOnProductSKU: string[] = (model?.addOns?.filter((x) => x.isRequired === true)?.map((y) => y.addOnValues?.find((x) => x.isDefault == true)?.sku) ?? []) as string[];
  if (addOnProductSKU?.length > 0) {
    addOnSKU = addOnProductSKU.filter((x) => x !== "").join(",");
  }
  if ((addOnSKU !== undefined && model.quantity && model.quantity > 0 && model.quantity !== undefined) || (addOnSKU != null && productType === "GroupedProduct")) {
    await checkAddOnInventory(model, addOnSKU, minQuantity);
  }
  model.highlightList = model && model.attributes ? getHighlightListFromAttributes(model.attributes, model.sku, Number(model.znodeProductId)) : [];
  getProductFinalPrice(model, model.addOns ?? [], minQuantity, addOnSKU);
  if (model.productPrice == null || model.productPrice === undefined) {
    model.showAddToCart = false;
    model.inventoryMessage = "ErrorPriceNotAssociate";
  }
  if (sku) model.sku = sku;
  model.parentProductId = productId;
  model.isConfigurable = true;
  model.dynamicAttribute = model?.attributes?.filter((attribute) => attribute.isCustomField === true) || [];
  const selectedCode = getAttributeValue(model?.attributes as IBaseAttribute[], "OutOfStockOptions", "selectValues") as string;
  model.productType = getAttributeValue(model?.attributes as IBaseAttribute[], "ProductType", "selectValues") as string;
  model.isObsolete = getAttributeValue(model?.attributes as IBaseAttribute[], "IsObsolete", "attributeValues") === "true";
  if (model && selectedCode && selectedCode.length > 0) {
    model.allowBackOrdering = selectedCode === INVENTORY.ALLOW_BACK_ORDERING;
    model.disablePurchasing = selectedCode === INVENTORY.DISABLE_PURCHASING;
    model.dontTrackInventory = selectedCode === INVENTORY.DONT_TRACK_INVENTORY;
  }
  const video1 = getAttributeValue(model.attributes as IBaseAttribute[], `${PRODUCT.VIDEO}1`, "attributeValues");
  const video2 = getAttributeValue(model.attributes as IBaseAttribute[], `${PRODUCT.VIDEO}2`, "attributeValues");
  model.videoList = [];
  if (video1) {
    model.videoList.push({ attributeCode: "Video1", attributeValues: video1 as string });
  }
  if (video2) {
    model.videoList.push({ attributeCode: "Video2", attributeValues: video2 as string });
  }
  if (hasError) {
    const currentUser = userSession ? userSession : await getSavedUserSession();
    const catalogId = await getUserCatalogId(
      portalData?.publishCatalogId,
      portalData?.portalProfileCatalogId,
      portalData?.profileId,
      portalData?.portalFeatureValues,
      currentUser as IUser
    );
    const expand: ExpandCollection = await getProductExpands();
    const filters = getRequiredFilters(portalData, catalogId as number);
    const publishProduct = await PublishProduct_getPublishProductBySKU(model?.sku, productId, model?.sku, expand, filters);
    model.showAddToCart = false;
    const publishProductData = publishProduct.PublishProduct;
    const product = convertCamelCase(publishProductData);
    productInformation = product;
    model.addOns = product.addOns;
    if (product) {
      let attributeData;
      const videoData: IAttributeDetails[] = [];
      const parentProductImagePath = product.parentProductImageSmallPath;
      if (Object.keys(product.parentProductVideos).length > 0) {
        attributeData = model.attributes?.map((attribute) => {
          if (attribute.attributeCode?.toLowerCase() === "video1") {
            const videoList = product.parentProductVideos?.video1;
            videoList && videoData.push({ attributeCode: "Video1", attributeValues: videoList[0] });
          } else if (attribute.attributeCode?.toLowerCase() === "video2") {
            const videoList = product.parentProductVideos?.video2;
            videoList && videoData.push({ attributeCode: "Video2", attributeValues: videoList[0] });
          }
          return attribute;
        });
      }
      model.parentConfigurableProductName = product.parentConfigurableProductName;
      model.imageMediumPath = `${portalData.imageMediumUrl}${parentProductImagePath}`;
      model.imageThumbnailPath = `${portalData.imageThumbnailUrl}${parentProductImagePath}`;
      model.imageLargePath = `${portalData.imageLargeUrl}${parentProductImagePath}`;
      model.imageSmallPath = `${portalData.imageSmallUrl}${parentProductImagePath}`;
      model.alternateImages = product.parentProductAlternateImages;
      model.videoList = videoData;
      model.attributes = attributeData || product.attributes;
      model.seoUrl = product.seoUrl;
      model.znodeCategoryIds = product.znodeCategoryIds;
    }
  } else {
    productInformation = model;
  }
  return { ...productInformation, ...model };
}
