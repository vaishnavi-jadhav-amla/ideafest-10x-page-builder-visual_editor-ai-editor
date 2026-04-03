/* eslint-disable max-lines */
import { AREA, errorStack, logServer } from "@znode/logger/server";
import {
  CategoryContents_productsByCategoryCode,
  HighlightCodeResponse,
  HighlightModelResponse,
  Highlights_highlightsByHighLightCode,
  Highlights_withDescriptionByHighlightCode,
  PublishBrands_productsByBrandCode,
  PublishProducts_compareProducts,
  PublishProducts_configurableVariantsByPublishProductId,
  PublishProducts_inventoryByPublishProductId,
  PublishProducts_stockRequest,
  WebStoreWidgets_linkProductsBySku,
  WebStoreWidgets_products,
} from "@znode/clients/v2";
import {
  ExpandCollection,
  ExpandKeys,
  FilterCollection,
  FilterKeys,
  FilterOperators,
  convertCamelCase,
  convertPascalCase,
  generateTagName,
  getPortalHeader,
} from "@znode/utils/server";
import { IAttributeDetails, IBaseAttribute, ITabData } from "@znode/types/attribute";
import {
  IAttributesDetails,
  IInventory,
  IProduct,
  IProductAddOn,
  IProductCard,
  IProductHighlights,
  IProductList,
  IProductListCard,
  IProductListDetails,
  IProductListRequest,
  IProductPortalData,
  IQuery,
  IStockNotificationRequest,
} from "@znode/types/product";
import { IBaseWidget, IWidget } from "@znode/types/widget";
import {
  ICompareProduct,
  IConfigurableProduct,
  IGroupProductsDetails,
  IProductDetails,
  IPublishBundleProductsDetails,
  IRecentlyViewedSkuProductList,
} from "@znode/types/product-details";
import { IGlobalAttributeValues, IPortalDetail } from "@znode/types/portal";
import { INVENTORY, PRODUCT, PRODUCT_TYPE } from "@znode/constants/product";
import { ProductInventoryDetailResponse, PublishProduct_getProductInventory } from "@znode/clients/v1";
import { convertFirstLetterToUpperCase, extractValuesByCode, getAttributeValue, getSavedUserSession, stringToBoolean, stringToBooleanV2 } from "@znode/utils/common";
import { createPriceMap, fetchPriceList, mapPriceToProduct } from "../common";
import { getCatalogCode, getCategory, getCategoryExpands, getCategoryFilters, getContentCategoryFilters, getSubCategoriesData } from "../category";
import { getPersonalizedAttributes, isPersonalizedAttributesAvailable } from "../attributes/attributes";
import { getProductDetails, getRecentlyViewProductList } from "./product-details";
import { mapProductCardDetails, mapProductInformation, prepareProductList } from "./mapper";

import { CACHE_KEYS } from "@znode/constants/cache-keys";
import { CART_PORTAL_FLAGS } from "@znode/constants/cart";
import { COMMON } from "@znode/constants/common";
import { FilterTuple } from "@znode/clients/v2";
import { IAllLocationInventory } from "@znode/types/product";
import { IBrandDetail } from "@znode/types/brand";
import { ICategoryResponse } from "@znode/types/category";
import { IFacets } from "@znode/types/facet";
import { IFilterTuple } from "@znode/types/filter";
import { IGeneralSetting } from "@znode/types/general-setting";
import { ISearchParams } from "@znode/types/search-params";
import { IUser } from "@znode/types/user";
import { SortEnum } from "@znode/types/enums";
import { convertDateTime } from "@znode/utils/component";
import { createFacetList } from "./facet";
import { getBreadCrumbs } from "../breadcrumb";
import { getConfigurableProduct } from "../configurable-product";
import { getGeneralSettingList } from "../general-setting";
import { getHighlightListFromAttributes } from "./product-helper";
import { getPortalDetails } from "../portal";
import { getUserCatalogId } from "../user";

export async function getPortalData() {
  const portalData = await getPortalDetails();
  return portalData;
}

export async function getSubCategoriesList(categoryId: number, portalData: IPortalDetail, userData: IUser | null) {
  try {
    const widgetData: IBaseWidget = {
      widgetKey: "123",
      widgetCode: "CategoryGrid",
      typeOfMapping: "PortalMapping",
      displayName: "Category List",
      cmsMappingId: categoryId,
    };
    const categoryData = await getSubCategoriesData(widgetData, portalData, userData);
    return categoryData || [];
  } catch (error) {
    logServer.error(AREA.SUB_CATEGORY, errorStack(error));
    return [];
  }
}

export async function getProductList(categoryId: number, searchParams: ISearchParams = {}): Promise<IProductListDetails> {
  try {
    const portalDetails = await getPortalData();
    const { localeCode, localeId } = (await getPortalHeader()) || {};

    const portalData = {
      portalId: portalDetails.portalId,
      localeId: localeId,
      publishCatalogId: portalDetails.publishCatalogId,
      portalFeatureValues: portalDetails.portalFeatureValues,
      portalProfileCatalogId: portalDetails.portalProfileCatalogId,
      imageSmallUrl: portalDetails.imageSmallUrl,
      globalAttributes: portalDetails.globalAttributes,
      profileId: portalDetails.profileId,
      sortList: portalDetails.sortList,
      pageList: portalDetails.pageList,
      catalogCode: portalDetails.catalogCode,
      localeCode: localeCode,
      storeCode: portalDetails.storeCode,
      portalProfileCatalogCode: portalDetails.portalProfileCatalogCode,
    };
    const expand: ExpandCollection = await getCategoryExpands();
    const isLoginRequiredForPricingAndInventory =
      portalData.globalAttributes &&
      portalData.globalAttributes.find((a) => a.attributeCode?.toLowerCase() === PRODUCT.LOGIN_TO_SEE_PRICING_AND_INVENTORY.toLowerCase())?.attributeValue;
    const displayAllWarehousesStock =
      portalData.globalAttributes && portalData.globalAttributes.find((a) => a.attributeCode?.toLowerCase() === PRODUCT.DISPLAY_ALL_WAREHOUSES_STOCK.toLowerCase())?.attributeValue;
    const userData: IUser | null = await getSavedUserSession();
    const { publishCatalogId, portalFeatureValues, profileId, portalProfileCatalogId } = portalData || {};
    const userCatalogId = await getUserCatalogId(publishCatalogId, portalProfileCatalogId, profileId, portalFeatureValues, userData || {});
    const filters: IFilterTuple[] = await getCategoryFilters(portalData.portalId, portalData.localeId || 0, userCatalogId || 0, COMMON.TRUE_VALUE);
    const contentFilters: IFilterTuple[] = getContentCategoryFilters(portalData, displayAllWarehousesStock as string);
    const categoryData: ICategoryResponse = await getCategory(categoryId, filters, portalData.portalId);
    if (categoryData.catalogId && categoryData.categoryCode) {
      const productListRequest = await createProductListRequest(categoryData.catalogId, searchParams, portalData);
      productListRequest.CategoryId = categoryId;
      productListRequest.Category = categoryData?.categoryCode;
      const { productList, facetList }: IProductListDetails = await fetchAllProducts(
        expand,
        contentFilters,
        productListRequest,
        searchParams.sort,
        portalData,
        userData,
        categoryId
      );
      productList.categoryCode = categoryData.categoryCode;
      productList.categoryId = categoryId;
      productList.categoryTitle = categoryData?.attributes?.find((attribute: IBaseAttribute) => attribute.attributeCode === PRODUCT.CATEGORY_TITLE)?.attributeValues || "";
      productList.categoryName = categoryData?.categoryName || "";
      productList.shortDescription = categoryData?.attributes?.find((attribute: IBaseAttribute) => attribute.attributeCode === PRODUCT.SHORT_DESCRIPTION)?.attributeValues || "";
      productList.longDescription = categoryData?.attributes?.find((attribute: IBaseAttribute) => attribute.attributeCode === PRODUCT.LONG_DESCRIPTION)?.attributeValues || "";
      productList.loginToSeePricingAndInventory = isLoginRequiredForPricingAndInventory;
      productList.displayAllWarehousesStock = displayAllWarehousesStock;
      productList.sortList = portalData.sortList;
      productList.pageList = portalData.pageList;
      productList.storeCode = portalData.storeCode;
      productList.subCategories = await getSubCategoriesList(categoryId, portalData, userData);
      return { productList: productList || [], facetList: facetList, isEnableCompare: portalDetails.enableCompare };
    }
    return { productList: {} as IProductList, facetList: [], isEnableCompare: portalDetails.enableCompare };
  } catch (error) {
    logServer.error(
      AREA.CATEGORY,
      `The error occurred in the getProductList() method with parameters categoryId:${categoryId}, searchTerm:${searchParams?.searchTerm} in product.ts file. ${errorStack(error)}`
    );
    return { productList: {} as IProductList, facetList: [], isEnableCompare: false };
  }
}

//Get the brand product list.
export async function getBrandProductList(brandDetail: IBrandDetail, searchParams: ISearchParams) {
  try {
    const portalData = await getPortalDetails();
    const brandProps = brandDetail;
    const expand: ExpandCollection = await getCategoryExpands();
    brandProps.properties && (searchParams.properties = brandProps.properties);
    const productListRequest = await createProductListRequest(portalData?.publishCatalogId || 0, searchParams);
    productListRequest.Category = brandProps.typeOfMapping;
    productListRequest.BrandCode = brandProps.brandCode;
    // const brandFilters =  getBrandFilters(undefined, portalData.localeId, portalData.portalId, portalData.publishCatalogId, brandDetail.cmsMappingId);
    const productList = await fetchBrandProducts(expand, productListRequest, searchParams.sort, portalData);
    return { ...productList, isEnableCompare: portalData.enableCompare };
  } catch (error) {
    logServer.error(
      AREA.CATEGORY,
      `The error occurred in the getBrandProductList() method with parameters brandCode:${brandDetail?.brandCode}, cmsMappingId:${brandDetail?.cmsMappingId}, typeOfMapping:${brandDetail?.typeOfMapping
      }, brand:${brandDetail?.properties?.brand}, searchTerm:${searchParams?.searchTerm} in product.ts file. ${errorStack(error)}`
    );
    return getEmptyProductList();
  }
}

//Get widget product list
export async function getProductWidgetList(widget: IWidget): Promise<IProductList | null> {
  try {
    const portalDetails = await getPortalDetails();
    const userData = await getSavedUserSession();
    const { localeId, localeCode } = await getPortalHeader();
    const portalData = {
      storeCode: portalDetails?.storeCode,
      localeId: localeId,
      portalId: portalDetails?.portalId,
      localeCode: localeCode ?? "",
      publishCatalogId: portalDetails?.publishCatalogId,
      imageSmallUrl: portalDetails?.imageSmallUrl,
      globalAttributes: portalDetails?.globalAttributes,
    };
    widget.cmsMappingId = widget?.portalId;
    const catalogId = await getUserCatalogId(
      portalDetails.publishCatalogId,
      portalDetails.portalProfileCatalogId,
      portalDetails.profileId,
      portalDetails.portalFeatureValues,
      userData as IUser
    );
    const productExpand: ExpandCollection = await getProductExpands();

    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(
      FilterKeys.CacheTags,
      FilterOperators.Contains,
      generateTagName(`${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.CATALOG}`, portalDetails.storeCode || "", String(catalogId))
    );

    let dataProducts;
    if (widget.widgetKey)
      dataProducts = await WebStoreWidgets_products(
        widget.widgetKey,
        widget.cmsMappingId,
        portalData.localeCode,
        portalData.storeCode,
        widget.widgetCode || undefined,
        widget.typeOfMapping,
        catalogId || portalDetails.publishCatalogId,
        productExpand,
        cacheInvalidator.filterTupleArray as FilterTuple[]
      );

    const productInfo = convertCamelCase(dataProducts);
    if (!productInfo || productInfo.hasError || !productInfo.products) return null;

    const productList = await Promise.all(
      productInfo.products.map(async (product: { widgetsProductModel: IProduct }) => {
        const inventoryList = await mapProductInventory(product.widgetsProductModel, portalData);
        return {
          ...product.widgetsProductModel,
          inventory: inventoryList.inventory ? convertCamelCase(inventoryList.inventory) : [],
          allLocationQuantity: inventoryList.allLocationQuantity,
        };
      })
    );

    const productData = await createWidgetProductList(productList, portalData || ({} as IProductPortalData));
    return productData;
  } catch (error) {
    logServer.error(AREA.WIDGET, errorStack(error));
    return null;
  }
}

const mapProductInventory = async (products: IProduct, portalData: IProductPortalData): Promise<{ inventory: []; allLocationQuantity: number }> => {
  try {
    let inventoryList: ProductInventoryDetailResponse = {};
    const isGetAllLocationsInventory = portalData.globalAttributes?.find(
      (a) => a.attributeCode?.toLowerCase() === PRODUCT.DISPLAY_ALL_WAREHOUSES_STOCK.toLowerCase()
    )?.attributeValue;
    if (stringToBooleanV2(isGetAllLocationsInventory)) {
      const filters = await getProductFilters(
        portalData.portalId,
        portalData.localeId as number,
        portalData.publishCatalogId || 0,
        undefined,
        undefined,
        isGetAllLocationsInventory
      );
      const cacheInvalidator = new FilterCollection();
      cacheInvalidator.add(FilterKeys.CacheTags, FilterOperators.Contains, generateTagName(`${CACHE_KEYS.PORTAL}`, portalData.storeCode || ""));
      inventoryList = await PublishProduct_getProductInventory(products.publishProductId as number, undefined, filters, cacheInvalidator.filterTupleArray as FilterTuple[]);
    }

    return {
      inventory: inventoryList.ProductInventory?.Inventory ? convertCamelCase(inventoryList.ProductInventory?.Inventory) : [],
      allLocationQuantity: inventoryList.ProductInventory?.AllLocationQuantity || 0,
    };
  } catch {
    return {
      inventory: [],
      allLocationQuantity: 0,
    };
  }
};

export function generateKey(parameter: IWidget): string {
  try {
    const hasValidParams = parameter?.widgetCode && parameter.widgetKey && parameter.typeOfMapping && parameter.cmsMappingId;

    if (hasValidParams) {
      return `${parameter.widgetCode}${parameter.widgetKey}${parameter.typeOfMapping}${parameter.cmsMappingId}`;
    }
    return "";
  } catch (error) {
    logServer.error(AREA.WIDGET, errorStack(error));
    return "";
  }
}

/**
 * Get expand keys for products.
 * @returns expands.
 */
export async function getProductExpands() {
  const expands = new ExpandCollection();
  expands.add(ExpandKeys.Promotions);
  expands.add(ExpandKeys.Pricing);
  expands.add(ExpandKeys.Seo);
  expands.add(ExpandKeys.AssociatedProducts);
  expands.add(ExpandKeys.Inventory);
  expands.add(ExpandKeys.ProductReviews);
  expands.add(ExpandKeys.ProductTemplate);
  expands.add(ExpandKeys.AddOns);
  return expands;
}

export async function fetchAllProducts(
  expand: ExpandCollection,
  filters: IFilterTuple[],
  productListModel: IProductListRequest,
  sort?: string | null,
  portalData?: IProductPortalData,
  userData?: IUser | null,
  categoryId?: number
) {
  const refineBy = JSON.stringify(productListModel.RefineBy);
  const catalogCode = await getCatalogCode(portalData as IPortalDetail);

  const cacheInvalidator = new FilterCollection();
  cacheInvalidator.add(
    FilterKeys.CacheTags,
    FilterOperators.Contains,
    generateTagName(`${CACHE_KEYS.CATALOG},${CACHE_KEYS.CATEGORY}, ${CACHE_KEYS.DYNAMIC_TAG}`, catalogCode || "", String(categoryId), "ProductsByCategoryCode")
  );

  const categoryProducts = await CategoryContents_productsByCategoryCode(
    productListModel?.Category as string,
    catalogCode as string,
    portalData?.localeCode as string,
    portalData?.storeCode as string,
    PRODUCT.ADDITIONAL_INFO,
    refineBy,
    expand,
    filters as FilterTuple[],
    (await getSortByProductList(Number(sort))) || null,
    productListModel.PageIndex || 1,
    productListModel.PageSize || 1,
    cacheInvalidator.filterTupleArray as FilterTuple[]
  );

  const productList = await createProductList(convertCamelCase(categoryProducts), portalData || ({} as IProductPortalData), userData);

  const facetList = createFacetList(categoryProducts?.Facets) as IFacets[];
  return { productList, facetList };
}

export async function fetchBrandProducts(
  expand: ExpandCollection,
  productListModel: IProductListRequest,
  sort?: string | null,
  portalData?: IProductPortalData
  // filters?: IFilterTuple[]|undefined,
) {
  const refineBy = JSON.stringify(productListModel.RefineBy);
  const catalogCode = await getCatalogCode(portalData as IPortalDetail);
  const cacheInvalidator = new FilterCollection();
  cacheInvalidator.add(FilterKeys.CacheTags, FilterOperators.Contains, generateTagName(`${CACHE_KEYS.CATALOG}`, catalogCode || ""));

  const categoryProducts = await PublishBrands_productsByBrandCode(
    productListModel?.BrandCode as string,
    catalogCode as string,
    portalData?.localeCode as string,
    portalData?.storeCode as string,
    PRODUCT.ADDITIONAL_INFO,
    refineBy,
    "",
    expand,
    undefined,
    (await getSortByProductList(Number(sort))) || null,
    productListModel.PageIndex || 1,
    productListModel.PageSize || 1
  );

  const userData: IUser | null = await getSavedUserSession();

  const productList = await createProductList(convertCamelCase(categoryProducts), portalData || ({} as IProductPortalData), userData);
  if (productList) {
    productList.sortList = portalData?.sortList || [];
    productList.pageList = portalData?.pageList || [];
    productList.facetData = convertCamelCase(categoryProducts)?.facets || [];
    productList.loginToSeePricingAndInventory = portalData?.globalAttributes?.find(
      (a) => a.attributeCode?.toLowerCase() === PRODUCT.LOGIN_TO_SEE_PRICING_AND_INVENTORY.toLowerCase()
    )?.attributeValue;
  }
  return productList;
}
const createProductList = async (categoryProducts: { products: IProduct[] }, portalData: IProductPortalData, userData?: IUser | null) => {
  if (!categoryProducts?.products?.length) {
    return getEmptyProductList();
  }

  const userId = Number(userData?.userId || 0);
  const processedProducts = processProductData(categoryProducts.products, portalData, userId);

  const productList = prepareProductList({ ...categoryProducts, products: processedProducts as [] });
  return productList as IProductList;
};

const createWidgetProductList = async (products: IProduct[], portalData: IProductPortalData) => {
  if (!products?.length) {
    return getEmptyProductList();
  }
  const userData = await getSavedUserSession();
  const userId = Number(userData?.userId || 0);
  const processedProducts = processProductData(products, portalData, userId);
  const productList = prepareProductList({ products: processedProducts as [] }, portalData);
  return productList as IProductList;
};

export const processProductData = (products: IProduct[], portalData: IProductPortalData, userId?: number): IProductCard[] => {
  return products.map((product: IProduct) => {
    const highlightList = getHighlightListFromAttributes(product.attributes || [], product.sku, product.znodeProductId);
    return mapProductCardDetails(product as IProduct, portalData?.globalAttributes as IGlobalAttributeValues[], userId || 0, highlightList);
  }) as IProductCard[];
};

export async function getProductListFilters(
  portalId: number,
  localeId: number,
  catalogId: number,
  isGetAllLocationsInventory?: string,
  userDetails?: IUser,
  isProductInheritanceEnabled?: boolean,
  isGetParentCategory?: string,
  isActive?: string,
  isRecentlyViewCall?: boolean
) {
  const filters: FilterCollection = new FilterCollection();
  filters.add(FilterKeys.ZnodeCatalogId, FilterOperators.Equals, catalogId.toString());
  if (localeId && localeId > 0) filters.add(FilterKeys.LocaleId, FilterOperators.Equals, localeId.toString());
  if (isGetAllLocationsInventory) filters.add(FilterKeys.IsGetAllLocationsInventory, FilterOperators.Equals, isGetAllLocationsInventory.toString());
  if (isProductInheritanceEnabled === true) filters.add(FilterKeys.IsProductInheritanceEnabled, FilterOperators.Equals, isProductInheritanceEnabled?.toString());
  if (isGetParentCategory) filters.add(FilterKeys.IsGetParentCategory, FilterOperators.Equals, isGetParentCategory);
  if (isActive !== undefined) filters.add(FilterKeys.IsActive, FilterOperators.Equals, isActive);
  if (isRecentlyViewCall) filters.add(FilterKeys.IsRecentlyViewCall, FilterOperators.Equals, isRecentlyViewCall?.toString() || "");
  filters.add(FilterKeys.PortalId, FilterOperators.Equals, portalId?.toString());
  return filters.filterTupleArray;
}

export async function createProductListRequest(catalogId: number, searchParams: ISearchParams, portalData?: IProductPortalData): Promise<IProductListRequest> {
  const pageValue: number = portalData?.pageList?.find((m) => m.isDefault)?.pageValue ?? 16;

  const productListRequest: IProductListRequest = {
    PageNumber: Number(searchParams?.pageNumber) || 1,
    PageIndex: Number(searchParams?.pageNumber) || 1,
    PageSize: Number(searchParams?.pageSize) || pageValue,
    CatalogId: catalogId,
    IsFacetList: true,
    RefineBy: await getFacetFilter(searchParams),
    UseSuggestion: true,
    Keyword: searchParams?.searchTerm || "", // Fallback to empty string if undefined
  };

  // Append LocaleId if available
  if (portalData?.localeId !== undefined) {
    productListRequest.LocaleId = portalData.localeId;
  }

  // Append PortalId if available
  if (portalData?.portalId !== undefined) {
    productListRequest.PortalId = portalData.portalId;
  }

  // Append IsProductInheritanceEnabled if available
  if (portalData?.portalFeatureValues?.enableProductInheritance !== undefined) {
    productListRequest.IsProductInheritanceEnabled = portalData.portalFeatureValues.enableProductInheritance;
  }

  return productListRequest;
}

export async function getFacetFilter(filterParam: ISearchParams): Promise<{ [key: string]: string[] }> {
  const dictionary: { [key: string]: string[] } = {};

  // Handle 'Brand' property
  if (filterParam?.properties?.Brand) {
    dictionary["Brand"] = [filterParam.properties.Brand];
  }

  filterParam?.facetGroup?.split(",").forEach((element: string) => {
    const [facetName, facetValues] = element.split("|");
    if (facetName && facetValues) {
      dictionary[facetName] = facetValues.split("~");
    }
  });

  return dictionary;
}

export async function getSortByProductList(sort: number): Promise<{ [key: string]: string }> {
  const sortCollection: { [key: string]: string } = {};
  if (sort !== undefined) {
    switch (sort) {
      case SortEnum.NameAToZ:
        sortCollection["ProductName"] = COMMON.ASC;
        break;
      case SortEnum.NameZToA:
        sortCollection["ProductName"] = COMMON.DESC;
        break;
      case SortEnum.PriceHighToLow:
        sortCollection["Price"] = COMMON.DESC;
        break;
      case SortEnum.PriceLowToHigh:
        sortCollection["Price"] = COMMON.ASC;
        break;
      case SortEnum.HighestRating:
        sortCollection["HighestRated"] = COMMON.DESC;
        break;
      case SortEnum.MostReviewed:
        sortCollection["MostReviewed"] = COMMON.DESC;
        break;
      case SortEnum.OutOfStock:
        sortCollection["OutOfStock"] = COMMON.DESC;
        break;
      case SortEnum.InStock:
        sortCollection["InStock"] = COMMON.DESC;
        break;
      case SortEnum.SortbyPopular:
        sortCollection["NumberOfOrders"] = COMMON.DESC;
        break;
      default:
        break;
    }
  }
  return sortCollection;
}

const getEmptyProductList = (): IProductList => {
  return prepareProductList({
    products: [],
    totalProductCount: 0,
    searchProfileId: 0,
    totalCMSPageCount: 0,
    pageNumber: 0,
    pageSize: 0,
    globalAttributes: [],
  });
};

/**
 * Get filters for product.
 * @param portalId
 * @param localeId
 * @param catalogId
 * @returns filters.
 */
export function getProductFilters(
  portalId: number,
  localeId: number,
  catalogId: number,
  productId?: number,
  IsActive?: string,
  isGetAllLocationsInventory?: string,
  isGetParentCategory?: string
) {
  const filters: FilterCollection = new FilterCollection();
  filters.add(FilterKeys.ZnodeCatalogId, FilterOperators.Equals, catalogId.toString());
  if (localeId > 0) filters.add(FilterKeys.LocaleId, FilterOperators.Equals, localeId.toString());
  if (productId) filters.add(FilterKeys.ZnodeProductId, FilterOperators.Equals, productId.toString());
  filters.add(FilterKeys.PortalId, FilterOperators.Equals, portalId.toString());
  if (IsActive !== undefined) filters.add(FilterKeys.IsActive, FilterOperators.Equals, IsActive);
  if (isGetAllLocationsInventory) filters.add(FilterKeys.IsGetAllLocationsInventory, FilterOperators.Equals, isGetAllLocationsInventory);
  if (isGetParentCategory) filters.add(FilterKeys.IsGetParentCategory, FilterOperators.Equals, isGetParentCategory);
  return filters.filterTupleArray;
}

export async function getProductInformation(id: number, queryParams: IQuery) {
  let productBasicDetails: IProductDetails | undefined;
  const userDetails = (await getSavedUserSession()) as IUser;
  const userId: number = userDetails?.userId ?? 0;
  const hasQueryParams = queryParams && Object.keys(queryParams).length > 0;
  const portalData = await getPortalDetails();

  const parentProductId = Number(queryParams?.parentProductId);

  if (hasQueryParams && parentProductId) {
    productBasicDetails = await getConfigurableProduct(queryParams, portalData, userDetails);
  } else {
    productBasicDetails = (await getProductData(Number(id), userDetails, portalData)) as IProductDetails;
  }
  if (!productBasicDetails || Object.keys(productBasicDetails).length === 0) {
    return { productBasicDetails };
  }

  const loginRequired = getGlobalAttributeValue(portalData, CART_PORTAL_FLAGS.LOGIN_TO_SEE_PRICING_INVENTORY);

  const generalSettings: IGeneralSetting = await getGeneralSettingList();

  if (productBasicDetails.productReviews) {
    productBasicDetails.productReviews = productBasicDetails.productReviews.map((review) => ({
      ...review,
      formattedDate: convertDateTime(review.createdDate, generalSettings.dateFormat, generalSettings.timeFormat, generalSettings.displayTimeZone),
    }));
  }
  const variants =
    (productBasicDetails.isDisplayVariantsOnGrid && productBasicDetails.attributes.filter((attribute) => attribute.isConfigurable).map((attribute) => attribute.attributeCode)) ||
    [];
  const shouldFetchConfigurableProducts = productBasicDetails.isDisplayVariantsOnGrid;
  const configurableProducts = shouldFetchConfigurableProducts ? await getAssociatedConfigurable(Number(id), variants.join(","), portalData) : [];
  const categoryId = Array.isArray(productBasicDetails?.znodeCategoryIds) ? productBasicDetails?.znodeCategoryIds.at(-1) : productBasicDetails?.znodeCategoryIds;
  const breadCrumb = (await getBreadCrumbs(categoryId || 0, true)).breadCrumb;
  productBasicDetails.breadCrumbTitle = breadCrumb;

  const tabList = getAttributesAsTabs(
    ["LongDescription", "ProductSpecification", "ShippingInformation"],
    productBasicDetails?.attributes,
    {
      productId: (productBasicDetails?.configurableProductId || productBasicDetails.publishProductId) as number,
      name: productBasicDetails.name,
      sku: productBasicDetails.sku,
      seoUrl: productBasicDetails.seoUrl || "",
    },
    productBasicDetails?.dynamicAttribute
  );

  if (!userId && loginRequired) {
    productBasicDetails.retailPrice = 0;
    productBasicDetails.salesPrice = 0;
  }
  if (isPersonalizedAttributesAvailable(productBasicDetails.attributes ?? [])) {
    productBasicDetails.attributes = (await getPersonalizedAttributes(productBasicDetails.attributes ?? [], productBasicDetails.publishProductId)) || [];
  }
  productBasicDetails.storeName = portalData.storeName;

  return { configurableProducts, productBasicDetails, tabList };
}

const getGlobalAttributeValue = (currentPortal: IPortalDetail, attributeCode: string) => {
  const attributeValue = currentPortal.globalAttributes?.find((a) => a?.attributeCode?.toLowerCase() === attributeCode.toLowerCase())?.attributeValue === "true" || false;
  return attributeValue;
};

export async function getAssociatedConfigurable(id: number, variants: string, portalData?: IPortalDetail) {
  const configurableProducts = await getAssociatedConfigurableVariants(Number(id), variants, portalData);
  return configurableProducts;
}

export async function getAssociatedConfigurableVariants(productId: number, variants: string, portalData?: IPortalDetail) {
  try {
    const catalogCode = await getCatalogCode(portalData as IPortalDetail);
    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(
      FilterKeys.CacheTags,
      FilterOperators.Contains,
      generateTagName(
        `${CACHE_KEYS.PUBLISH_PRODUCT}, ${CACHE_KEYS.CATALOG}, ${CACHE_KEYS.DYNAMIC_TAG} `,
        productId.toString(),
        catalogCode || "",
        "ConfigurableVariantsByPublishProductId"
      )
    );
    const publishProductListData = await PublishProducts_configurableVariantsByPublishProductId(
      productId,
      `${variants},ProductImage`,
      cacheInvalidator.filterTupleArray as FilterTuple[]
    );
    const publishProductListModel = convertCamelCase(publishProductListData);
    if (publishProductListModel && publishProductListModel.configurableProducts) {
      const webStoreConfigurableProductList = publishProductListModel?.configurableProducts?.length > 0 ? publishProductListModel.configurableProducts : null;
      const configurableProductList = mapToConfigurableProductModelList(webStoreConfigurableProductList as IConfigurableProduct[]);
      return configurableProductList;
    }
  } catch (error) {
    logServer.error(
      AREA.PRODUCT,
      `The error occurred in the getAssociatedConfigurableVariants() method with parameters productId:${productId}, variants:${variants}, profileId:${portalData?.profileId
      }, catalogCode:${portalData?.catalogCode} in product.ts file. ${errorStack(error)}`
    );
    return [] as IConfigurableProduct[];
  }
}

export function mapToConfigurableProductModelList(webStoreConfigurableProductList: Array<IConfigurableProduct>) {
  const configurableProductsMap = new Map<number, IConfigurableProduct>();

  webStoreConfigurableProductList?.forEach((variant: IConfigurableProduct) => {
    const publishProductId = variant.publishProductId;

    if (!configurableProductsMap.has(publishProductId)) {
      const configurableProductModel: IConfigurableProduct = {
        ...variant,
        inventoryMessage: "In Stock",
        showAddToCart: true,
        imageName: variant.imageLargePath,
        attributes: variant.attributes ? JSON.parse(String(variant.attributes)) : ([] as IAttributeDetails[]),
      };
      configurableProductsMap.set(publishProductId, configurableProductModel);
    }
  });

  return Array.from(configurableProductsMap.values());
}

export async function getRecentlyViewProductData(id: number, userSession: IUser | null, portalData: IPortalDetail, catalogCode: string, filters: FilterTuple[]) {
  try {
    const productId = Number(id);
    const product = await getRecentlyViewProductList(productId, portalData, userSession, catalogCode, filters);
    return product;
  } catch (error) {
    logServer.error(AREA.RECENTLY_VIEWED_PRODUCT, errorStack(error));
    return null;
  }
}

export async function getProductData(id: number, userSession?: IUser | null, portalData?: IPortalDetail) {
  try {
    const productId = Number(id);
    const product = await getProductDetails(productId, portalData, userSession);
    return product;
  } catch (error) {
    logServer.error(
      AREA.PRODUCT,
      `The error occurred in the getProductData() method with parameters ${id}, name:${portalData?.name}, storeCode:${portalData?.storeCode}, userName:${userSession?.userName
      } in product.ts file. ${errorStack(error)}`
    );
    return null;
  }
}

export const getRecentlyViewProductFilters = async (portalData: IProductPortalData, userData: IUser) => {
  const { portalId, publishCatalogId, localeId, profileId, portalProfileCatalogId, portalFeatureValues } = portalData;
  const catalogId = await getUserCatalogId(publishCatalogId, portalProfileCatalogId, profileId, portalFeatureValues, userData);
  const filters: FilterTuple[] = (await getProductListFilters(
    portalId,
    localeId ?? 0,
    catalogId ?? 0,
    undefined,
    userData,
    undefined,
    undefined,
    undefined,
    true
  )) as FilterTuple[];
  return convertPascalCase(filters);
};

export const getRecentlyViewProducts = async (productSkuList: IRecentlyViewedSkuProductList[]) => {
  try {
    if (productSkuList && productSkuList.length > 0) {
      const userDetails = await getSavedUserSession();
      const portalData = await getPortalDetails();
      const catalogCode = (await getCatalogCode(portalData, userDetails as IUser)) || "";
      const filters = await getRecentlyViewProductFilters(portalData, userDetails as IUser);
      const productList = await Promise.all(
        productSkuList.map(async (product) => {
          try {
            const productInfo = await getRecentlyViewProductData(Number(product.publishProductId), null, portalData, catalogCode, filters);
            if (!productInfo) return null;
            if(portalData.isAddToCartOptionForProductSlidersEnabled)
            {
              productInfo.shouldShowViewDetails = isViewDetailsEnable(
                productInfo.attributes,
                productInfo.productType as string,
                productInfo.addOns as IProductAddOn[],
                productInfo.groupProductList,
                productInfo.configurableData?.configurableAttributes || []
              );
            }
            productInfo.highlightList =
              productInfo && productInfo.attributes ? getHighlightListFromAttributes(productInfo.attributes, productInfo.sku, Number(productInfo.znodeProductId)) : [];
            return (
              mapProductInformation(
                productInfo,
                portalData?.globalAttributes as IGlobalAttributeValues[],
                Number(portalData?.portalId),
                Number(portalData?.localeId),
                Number(portalData?.publishCatalogId),
                userDetails,
                true
              ) || null
            );
          } catch (error) {
            logServer.error(
              AREA.PRODUCT,
              `The error occurred in the getRecentlyViewProducts() method with sku's:${productSkuList?.map((p) => p.sku).join(", ") || ""} in product.ts file. ${errorStack(error)}`
            );
            return null;
          }
        })
      );
      return productList.filter((product) => product !== null);
    }
    return [];
  } catch (error) {
    logServer.error(AREA.RECENTLY_VIEWED_PRODUCT, errorStack(error));
    return [];
  }
};

const isViewDetailsEnable = (
  attributes: IAttributeDetails[],
  productType: string,
  addOns: IProductAddOn[],
  groupProductList: IGroupProductsDetails[] | undefined,
  variants: IAttributeDetails[]
) => {
  const isObsoleteAttributeValue = getAttributeValue(attributes as IAttributeDetails[], PRODUCT.IS_OBSOLETE, "attributeValues");
  const isObsolete = stringToBoolean(isObsoleteAttributeValue as string);
  const isPersonalize = getAttributeValue(attributes as IAttributeDetails[], "Personalizable", "attributeValues") ? true : false;
  const isGroupProduct = (groupProductList?.length ?? 0) > 0;
  const isConfigurable = variants?.length > 0;
  const shouldShowViewDetails =
    productType === PRODUCT_TYPE.CONFIGURABLE_PRODUCT ||
    productType === PRODUCT_TYPE.BUNDLE_PRODUCT ||
    productType === PRODUCT_TYPE.GROUPED_PRODUCT ||
    isGroupProduct ||
    (addOns && addOns?.length > 0 && !isObsolete) ||
    isPersonalize ||
    isConfigurable;
  return shouldShowViewDetails;
};

/**
 * Get the link product list.
 * @param ILinkProductParameter
 * @returns  link Product List.
 */
export async function getLinkProductList(sku: string, productId: number) {
  try {
    const portalData = await getPortalDetails();
    const expand: ExpandCollection = await getProductExpands();
    const userDetails = await getSavedUserSession();
    const catalogCode = await getCatalogCode(portalData);
    const cacheInvalidator = new FilterCollection();

    if (portalData)
      cacheInvalidator.add(
        FilterKeys.CacheTags,
        FilterOperators.Contains,
        generateTagName(
          `${CACHE_KEYS.PORTAL},${CACHE_KEYS.PUBLISH_PRODUCT}, ${CACHE_KEYS.LINK_PRODUCT}, ${CACHE_KEYS.DYNAMIC_TAG}`,
          portalData.storeCode || "",
          String(productId),
          sku,
          "LinkProductsBySku"
        )
      );
    const linkProductList = await WebStoreWidgets_linkProductsBySku(
      sku,
      portalData?.localeCode,
      catalogCode as string,
      portalData?.storeCode as string,
      expand,
      cacheInvalidator.filterTupleArray as FilterTuple[]
    );
    const productListDetails = convertCamelCase(linkProductList.LinkProductsList);

    if (productListDetails.length > 0) {
      const filterProductList = await Promise.all(
        productListDetails.map(async (productInfo: { attributeName?: string; publishProduct?: IProductDetails[] }) => {
          const productList = await mapProductInformationWithInventory(
            productInfo.publishProduct as IProductDetails[],
            Number(portalData?.portalId),
            Number(portalData?.localeId),
            Number(portalData?.publishCatalogId),
            portalData?.globalAttributes as IGlobalAttributeValues[],
            userDetails,
            portalData?.isAddToCartOptionForProductSlidersEnabled as boolean
          );
          return {
            name: productInfo.attributeName,
            products: productList,
          };
        })
      );

      try {
        let productList = filterProductList.filter((product) => product !== null);

        //Mapping realtime price.
        if (process.env.ENABLE_REAL_TIME_PRICING !== "false") {
          if (Array.isArray(productList) && productList?.length > 0) {
            const skus = productList.flatMap((item) => item.products.map((p: IProductListCard) => p.sku));
            if (skus.length === 0) {
              return productList;
            }
            const priceList = await fetchPriceList(skus.join(","));
            const priceMap = createPriceMap(priceList);

            productList = productList.map((productSection) => ({
              ...productSection,
              products: productSection?.products?.map((product: IProductListCard) => mapPriceToProduct(product, priceMap)),
            }));
          }
        }
        return productList;
      } catch (err) {
        logServer.error(AREA.PRODUCT, `Failed to fetch and map product prices in the getLinkProductList(${sku}, ${productId}) method. ${errorStack(err)}`);
        throw err;
      }
    }
    return [];
  } catch (error) {
    logServer.error(AREA.PRODUCT, `The error occurred in the getLinkProductList(${sku}, ${productId}) method. ${errorStack(error)}`);
    return [];
  }
}

export function generatesKey(parameter: IWidget) {
  if (parameter.cmsMappingId) {
    return parameter.cmsMappingId + parameter.widgetKey;
  }
}

const mapProductInformationWithInventory = async (
  productListDetails: IProductDetails[],
  portalId: number,
  localeId: number,
  publishCatalogId: number,
  globalAttributes: IGlobalAttributeValues[],
  userDetails: IUser | null,
  isAddToCartOptionForProductSlidersEnabled : boolean
) => {
  return await Promise.all(
    productListDetails.map(async (product: IProductDetails) => {
      if(isAddToCartOptionForProductSlidersEnabled)
        {
          product.shouldShowViewDetails = isViewDetailsEnable(
            product.attributes as IAttributeDetails[],
            getAttributeValue(product.attributes as IAttributeDetails[], "productType", "selectValues", 0, "code") as string,
            product.addOns as IProductAddOn[],
            product.groupProductList,
            product.configurableData?.configurableAttributes || []
          );
        }
      product.highlightList = getHighlightListFromAttributes(product.attributes || [], product.sku, product.publishProductId as number);

      return await mapProductInformation(
        convertCamelCase(product),
        globalAttributes as IGlobalAttributeValues[],
        Number(portalId),
        Number(localeId),
        Number(publishCatalogId),
        userDetails
      );
    })
  );
};

const bundledProductChildValidOrNot = (childBundleItems: IPublishBundleProductsDetails[], retailPrice: number | null) => {
  const isOutOfStock = childBundleItems.some((item) => {
    const outOfStockOption = getAttributeValue(item.attributes || [], PRODUCT.OUT_OF_STOCK_OPTIONS, "selectValues", 0, "code") || "";
    const disablePurchasing = outOfStockOption === INVENTORY.DISABLE_PURCHASING;
    return (item.quantity === 0 || item.quantity === null) && disablePurchasing;
  });
  const validChild = childBundleItems.some((item) => {
    const isObsoleteAttributeValue = getAttributeValue(item.attributes as IAttributeDetails[], PRODUCT.IS_OBSOLETE, "attributeValues");
    const isCallForPricing = getAttributeValue(item.attributes as IAttributeDetails[], PRODUCT.CALL_FOR_PRICING, "attributeValues") === " true";
    const isObsolete = stringToBoolean(isObsoleteAttributeValue as string);

    const priceNotSet = item.retailPrice === null && item.salesPrice === null;

    return isCallForPricing || isObsolete || priceNotSet;
  });
  if (retailPrice === null) {
    return true;
  } else if (isOutOfStock) {
    return true;
  } else if (validChild) {
    return validChild;
  } else {
    return false;
  }
};

const isViewDetailsCompareProduct = async (
  attributes: IAttributeDetails[],
  productType: string,
  addOns: IProductAddOn[],
  groupProductList: IGroupProductsDetails[] | undefined,
  variants: IAttributeDetails[],
  product: IProductDetails
) => {
  const isObsoleteAttributeValue = getAttributeValue(attributes as IAttributeDetails[], PRODUCT.IS_OBSOLETE, "attributeValues");
  const isCallForPricing = getAttributeValue(attributes as IAttributeDetails[], PRODUCT.CALL_FOR_PRICING, "attributeValues") === " true";
  const isObsolete = stringToBoolean(isObsoleteAttributeValue as string);
  if (isPersonalizedAttributesAvailable(attributes ?? [])) {
    attributes = (await getPersonalizedAttributes(attributes ?? [], product.publishProductId)) || [];
  }
  const personalizeList = attributes.filter((item) => item.isPersonalizable);
  const isPersonalize = personalizeList.some((item) => item.isRequired);
  const isGroupProduct = (groupProductList?.length ?? 0) > 0;
  const isConfigurable = variants?.length > 0;
  const isRequiredAddons = addOns && addOns?.length > 0 && addOns.some((item) => item.isRequired);

  const outOfStockOption = getAttributeValue(attributes, PRODUCT.OUT_OF_STOCK_OPTIONS, "selectValues", 0, "code") || "";
  const disablePurchasing = outOfStockOption === INVENTORY.DISABLE_PURCHASING;
  const outOfStockProduct = Number(product.quantity) === 0 && productType === PRODUCT_TYPE.SIMPLE_PRODUCT && disablePurchasing;

  const shouldShowViewDetails =
    productType === PRODUCT_TYPE.CONFIGURABLE_PRODUCT ||
    (productType === PRODUCT_TYPE.BUNDLE_PRODUCT &&
      (isRequiredAddons ||
        isPersonalize ||
        isCallForPricing ||
        bundledProductChildValidOrNot(product.publishBundleProducts as IPublishBundleProductsDetails[], product.retailPrice || null))) ||
    productType === PRODUCT_TYPE.GROUPED_PRODUCT ||
    isGroupProduct ||
    isRequiredAddons ||
    isPersonalize ||
    isConfigurable ||
    isCallForPricing ||
    outOfStockProduct ||
    isObsolete ||
    (product.retailPrice === null && product.salesPrice === null);
  return shouldShowViewDetails;
};

// Submit stock request.
export async function submitStockRequest(requestModel: IStockNotificationRequest) {
  try {
    if (requestModel) {
      const response = await PublishProducts_stockRequest(convertPascalCase(requestModel));
      return response.IsSuccess || false;
    }
    return false;
  } catch (error) {
    logServer.error(AREA.STOCK_NOTIFICATION, errorStack(error));
    return false;
  }
}

const getAttributesAsTabs = (
  attributeNames: string[],
  attributeData: IAttributeDetails[] = [],
  productData: {
    productId: number;
    name: string;
    sku: string;
    seoUrl: string;
  },
  dynamicAttribute?: IAttributeDetails[]
): ITabData[] => {
  const attributeKeys = ["attributeCode", "attributeValues", "attributeName"];
  const attributeCodes = ["ProductSpecification", "ShippingInformation", "LongDescription", "IsCustomField"];
  const mainAttributes = extractValuesByCode(attributeData, attributeKeys, attributeCodes);
  const tabs: ITabData[] =
    (attributeNames
      .map((name, index) => {
        const attribute = mainAttributes[name];
        if (attribute) {
          return {
            id: `tab${index}`,
            title: attribute.attributeName,
            content: attribute.attributeValues ?? "",
            isCustomField: false,
          };
        }
        return null;
      })
      .filter((tab) => tab !== null) as ITabData[]) || [];
  tabs.push({
    id: `review${tabs.length + 1}`,
    title: "Reviews",
    content: `/write-review?id=${productData.productId}&name=${encodeURIComponent(productData.name)}`,
    isCustomField: false,
  });
  let additionalInformation = "";

  if (dynamicAttribute && dynamicAttribute.length > 0) {
    dynamicAttribute?.forEach((attr) => {
      if (attr.isCustomField) {
        additionalInformation += `${attr.attributeName}: ${attr.attributeValues}<br/>`;
      }
    });
  }
  if (additionalInformation.length > 0) {
    tabs.push({
      id: PRODUCT.ADDITIONAL_INFORMATION,
      title: PRODUCT.ADDITIONAL_INFORMATION,
      content: additionalInformation,
      isCustomField: true,
    });
  }
  return tabs;
};

export async function allInventoryLocations(productId: number, catalogCode: string, localeCode: string, storeCode: string): Promise<IAllLocationInventory> {
  try {
    const inventories = await PublishProducts_inventoryByPublishProductId(productId, catalogCode, localeCode, storeCode);
    const inventoryLocations = convertCamelCase(inventories.Inventory);
    const defaultInventoryLocation = inventoryLocations?.find((item: IInventory) => item.isDefaultWarehouse);
    const inventoryWareHouse: string[] = [];
    const otherInventoryLocations = inventoryLocations?.filter((item: IInventory) => {
      if (!item.isDefaultWarehouse && item.warehouseName && !inventoryWareHouse.includes(item.warehouseName)) {
        inventoryWareHouse.push(item.warehouseName);
        return true; // Include this item
      }
      return false; // Exclude this item
    });

    return {
      inventory: otherInventoryLocations,
      defaultWarehouse: defaultInventoryLocation as IInventory,
    };
  } catch (error) {
    logServer.error(
      AREA.PRODUCT,
      `The error occurred in the allInventoryLocations() method with parameters productId:${productId}, catalogCode:${catalogCode}, localeCode:${localeCode}, storeCode:${storeCode} in the product.ts file. ${errorStack(
        error
      )}`
    );
    return {} as IAllLocationInventory;
  }
}

export async function getHighlightInfoByCode(highlightCode: string, productId: number) {
  const highlightModel: IProductHighlights = {};
  const cacheInvalidator = new FilterCollection();
  cacheInvalidator.add(FilterKeys.CacheTags, FilterOperators.Contains, generateTagName(`${CACHE_KEYS.PUBLISH_PRODUCT}`, String(productId)));
  const highlightDetailsResponse: HighlightCodeResponse = await Highlights_highlightsByHighLightCode(highlightCode, undefined, cacheInvalidator.filterTupleArray as FilterTuple[]);
  const highlightData = convertCamelCase(highlightDetailsResponse);
  if (highlightDetailsResponse) {
    const highlightDetails: IProductHighlights = {
      publishProductId: productId,
      highlightCode: highlightData.highlightCode,
      displayPopup: highlightData.displayPopup,
      highlightId: highlightData.highlightId,
      hyperlink: highlightData.hyperlink,
    };
    return highlightDetails;
  } else {
    return highlightModel;
  }
}

export async function getHighlightInfo(highlightCode: string, productId: number, catalogCode?: string) {
  const highlightModel: IProductHighlights = {};
  const cacheInvalidator = new FilterCollection();
  cacheInvalidator.add(
    FilterKeys.CacheTags,
    FilterOperators.Contains,
    generateTagName(`${CACHE_KEYS.CATALOG} ,${CACHE_KEYS.PUBLISH_PRODUCT}`, catalogCode || "", String(productId))
  );
  const highlightDetailsResponse: HighlightModelResponse = await Highlights_withDescriptionByHighlightCode(
    highlightCode,
    productId,
    cacheInvalidator.filterTupleArray as FilterTuple[]
  );
  const highlightData = convertCamelCase(highlightDetailsResponse);
  if (highlightDetailsResponse) {
    const highlightDetails: IProductHighlights = {
      publishProductId: productId,
      description: highlightData.description,
      highlightName: highlightData.highlightName,
    };
    return highlightDetails;
  } else {
    return highlightModel;
  }
}

export async function getCompareProductsDetails(portalData: IPortalDetail, productDetails: ICompareProduct[] = [], isProductListOnly: boolean) {
  try {
    if (!productDetails.length) return []; // Early return if no product details
    const productIds = productDetails.map((product) => product.sku).join(",");
    const expand: ExpandCollection = getExpandsForProductCompare();
    const portalInformation = await getPortalDetails();
    const filters: IFilterTuple[] = getProductFilters(portalData?.portalId || 0, portalData?.localeId || 0, portalData?.publishCatalogId || 0, 0, "true");
    const catalogCode = await getCatalogCode(portalData);
    const response = await PublishProducts_compareProducts(
      productIds,
      portalData.localeCode,
      catalogCode || portalData.publishCatalogCode,
      portalData.storeCode as string,
      expand,
      filters as FilterTuple[],
      undefined
    );
    const publishProducts = convertCamelCase(response?.PublishProducts) || [];
    let comparableAttributes: IAttributesDetails[] = [];
    if (!isProductListOnly) {
      comparableAttributes = Array.from(
        new Map(
          publishProducts
            .flatMap((product: IProductDetails) => product.attributes || []) // Flatten directly without intermediate array
            .filter((attr: IAttributesDetails) => attr.isComparable) // Only comparable attributes
            .map((attr: IAttributesDetails) => [attr.attributeCode, attr]) // Create a Map to remove duplicates
        ).values() as Iterable<IAttributesDetails>
      ).map(
        (attr: IAttributesDetails) =>
        ({
          attributeCode: (attr.attributeCode as string) || "",
          attributeName: attr.attributeName,
          attributeTypeName: attr.attributeTypeName,
          displayOrder: attr.displayOrder,
        } as IAttributesDetails)
      );
    }

    const isLoginToSeePricing = portalInformation?.globalAttributes?.find(
      (a) => a.attributeCode?.toLowerCase() === PRODUCT.LOGIN_TO_SEE_PRICING_AND_INVENTORY.toLowerCase()
    )?.attributeValue;

    const isLoginToSeePricingValue = typeof isLoginToSeePricing === "string" ? stringToBoolean(isLoginToSeePricing) : isLoginToSeePricing;
    const filterProductList = await Promise.all(
      publishProducts.map(async (product: IProductDetails) => {
        const isObsolete = product?.isObsolete;
        const isCallForPricing = getAttributeValue(product.attributes || [], "CallForPricing", "attributeValues") === PRODUCT.TRUE_VALUE;
        const callForPricingMessage = product?.promotions?.filter((x) => x.promotionType?.toLowerCase() === "Call For Pricing".toLowerCase()).at(0)?.promotionMessage;
        const additionalInformationCompareProduct: { [key: string]: string | number | Date | null } = {};
        if (!isProductListOnly) {
          comparableAttributes.length > 0 &&
            comparableAttributes.forEach((element: IAttributesDetails) => {
              const attributeCode = element.attributeCode;
              if (element.attributeTypeName === "Multi Select" || element.attributeTypeName === "Simple Select") {
                additionalInformationCompareProduct[attributeCode as string] = getAttributeValue(product.attributes || [], attributeCode as string, "selectValues");
              } else {
                additionalInformationCompareProduct[attributeCode as string] = getAttributeValue(product.attributes || [], attributeCode as string, "attributeValues");
              }
            });
        }

        return {
          name: product.name,
          sku: product.sku,
          attributes: product.attributes,
          productId: product.publishProductId,
          rating: product.rating || 0,
          image: product.imageThumbNailPath,
          variantDescription: generateConfigurableDescriptions(product.attributes),
          retailPrice: product.retailPrice,
          salesPrice: product.salesPrice,
          quantity: product.quantity,
          totalReviews: product.totalReviews,
          isObsolete,
          isCallForPricing,
          sKU: product.sku,
          seoUrl: product.seoUrl,
          isOutOfStock:
            Number(product.inStockQty) <= 0 &&
            ((product.retailPrice && product.retailPrice > 0) ||
              getAttributeValue(product.attributes as IAttributeDetails[], "productType", "selectValues", 0, "code") === PRODUCT_TYPE.BUNDLE_PRODUCT),
          isShowViewDetails: !isProductListOnly
            ? await isViewDetailsCompareProduct(
              product.attributes as IAttributeDetails[],
              getAttributeValue(product.attributes as IAttributeDetails[], "productType", "selectValues", 0, "code") as string,
              product.addOns as IProductAddOn[],
              product.groupProductList,
              product.configurableData?.configurableAttributes || [],
              product
            )
            : false,
          callForPricingMessage,
          ...additionalInformationCompareProduct,
          productType: getAttributeValue(product.attributes as IAttributeDetails[], PRODUCT.PRODUCT_TYPE, "selectValues", 0, "value") as string,
        };
      })
    );

    // Rearrange products based on the desiredOrder
    const reorderedProductList = productDetails
      .map((item) => filterProductList.find((product: IProductDetails) => product.sku === item.sku))
      .filter((product) => product !== undefined);

    comparableAttributes.sort((a, b) => (a?.displayOrder ?? 0) - (b?.displayOrder ?? 0));
    return convertCamelCase({ productList: reorderedProductList, comparableAttributes, isLoginToSeePricing: isLoginToSeePricingValue });
  } catch (error) {
    logServer.error(
      AREA.PRODUCT,
      `The error occurred in the getCompareProductsDetails() method with parameters portalId:${portalData?.portalId}, localeId:${portalData?.localeId}, publishCatalogId:${portalData?.publishCatalogId
      }, localeCode:${portalData?.localeCode}, publishCatalogCode:${portalData?.publishCatalogCode}, storeCode:${portalData?.storeCode}, sku's:${productDetails?.map((p) => p.sku)?.join(", ") || ""
      }, ${isProductListOnly} in the product.ts file. ${errorStack(error)}`
    );
    return [];
  }
}

const generateConfigurableDescriptions = (attributesList: IBaseAttribute[]) => {
  const filterAttributeList = attributesList.filter((item) => item.isConfigurable);
  let description = "";
  if (filterAttributeList.length === 0) {
    return "-";
  }
  filterAttributeList.forEach((variantItem) => {
    description += `<div><strong>${variantItem.attributeName} : </strong> ${variantItem.configurableAttribute ? variantItem.configurableAttribute.map((x) => convertFirstLetterToUpperCase(x.attributeValue ?? "")).join(",") : "-"
      }</div>`;
  });

  return description;
};

export function getExpandsForProductCompare() {
  const expands = new ExpandCollection();
  expands.add(ExpandKeys.Promotions);
  expands.add(ExpandKeys.Inventory);
  expands.add(ExpandKeys.ProductReviews);
  expands.add(ExpandKeys.Pricing);
  expands.add(ExpandKeys.ProductTemplate);
  expands.add(ExpandKeys.AddOns);
  expands.add(ExpandKeys.SEO);
  expands.add(ExpandKeys.ConfigurableAttribute);
  expands.add(ExpandKeys.Promotions);
  expands.add(ExpandKeys.WishlistAddons);
  return expands;
}
