import { IBaseAttribute, IProductAttributes, IProperty, ISelectValuesDetails } from "./attribute";
import { IConfigurableProduct, IGroupProductsDetails, IProductInventoryMessage, IProductReview, IPublishBundleProductsDetails, ISelectedAddOn } from "./product-details";
import { IGlobalAttributeValues, IPageList, IPortalFeatureValues, ISortingOptions } from "./portal";

import { IBase } from "./base";
import { ICartItemValidation } from "./cart";
import { ICategory } from "./category";
import { IFacets } from "./facet";
import { IProductPricingDetailsResponse } from "./search-typeahead";

export interface IProductListResponse extends IBase {
  products: IProductListCard[];
  totalProductCount?: number;
  searchProfileId?: number | null;
  totalCMSPageCount?: number;
  pageNumber?: number | null;
  pageSize?: number | null;
  globalAttributes?: IGlobalAttributeValues[];
}

export interface IProduct extends IProductForMapping, IBase {
  publishProductId: number;
  znodeProductId: number;
  parentPublishProductId: number;
  znodeCategoryIds: number[];
  name: string;
  inventoryMessage: string;
  showAddToCart: boolean;
  sEOTitle: string;
  sEOUrl: string;
  imageLargePath: string;
  imageMediumPath: string;
  imageThumbNailPath: string;
  imageSmallPath: string;
  imageSmallThumbnailPath: string;
  addonProductSKUs: ISelectedAddOn[] | string;
  bundleProductSKUs: string[];
  configurableProductSKUs: string[];
  groupProductSKUs: string[];
  publishedCatalogId: number;
  rating: number;
  attributes: IBaseAttribute[];
  promotions: IPromotion[];
  addOns: IProductAddOn[];
  promotionId: number;
  inStockMessage: string;
  outOfStockMessage: string;
  backOrderMessage: string;
  isConfigurableProduct: boolean;
  configurableProductId: number;
  categoryName: string;
  catalogName: string;
  productName: string;
  productType: string;
  isActive: boolean;
  associatedAddOnProducts: string[];
  sku: string;
  defaultWarehouseName: string;
  defaultInventoryCount: number;
  hST?: number;
  gST?: number;
  pST?: number;
  vAT?: number;
  importDuty?: number;
  salesTax?: number;
  discountAmount?: number;
  publishBundleProducts: IPublishBundleProduct[];
  isCallForPricing: boolean;
  unitPrice: number;
  quantity: number;
  salesPrice: number | null;
  retailPrice: number | null;
  promotionalPrice: number;
  currencyCode: string;
  groupProductPriceMessage: string;
  inventory: IProductInventory[];
  cultureCode: string;
  allLocationQuantity: number;
  defaultWarehouseCount: number;
  highlightList: IHighlight[];
  totalReviews: number;
  shouldShowViewDetails: boolean;
}

export interface IProductCard {
  isCallForPricing: boolean;
  allWarehousesStock: boolean;
  unitOfMeasurement: string;
  stockNotification: string;
  productType: string;
  isObsolete: boolean;
  inventory: IProductInventory[];
  seoTitle: string;
  znodeCatalogId?: number;
  productId?: number;
  brandName: string;
  defaultWarehouseCount: number;
  name: string;
  quantity: number;
  rating: number;
  imageSmallPath: string;
  seoUrl: string;
  publishProductId: number;
  totalReviews: number;
  sku: string;
  allLocationQuantity: number;
  currencySuffix: string;
  shouldShowViewDetails: boolean;
  znodeProductId: number;
  promotions: IPromotion[];
  retailPrice: number | null;
  salesPrice: number | null;
  disablePurchasing: boolean;
  allowBackOrdering: boolean;
  isDonTrackInventory: boolean;
  isAddToCartDisabled: boolean;
  isConfigurableProduct: boolean;
  isActive: boolean;
  highlightList: IHighlight[];
}

export interface IProductForMapping {
  categoryIds?: number[];
  categoryRelationshipIds?: number[];
  externalId?: string;
  actionMode?: string;
  version?: number;
  boost?: number;
  swatchAttributesValues?: [];
  reOrderLevel?: number;
  portalId?: number;
  productId?: number;
  obsoleteClass?: string;
  currencySuffix?: string;
  associatedProducts?: string[];
  priceView?: string;
  [key: string]: unknown;
}

export interface IHighlight {
  highlightName: string;
  highlightCode: string;
  mediaPath: string;
  publishProductId: number;
  sku: string;
  displayOrder: number;
  description?: string;
}

export interface IPromotion extends IBase {
  publishProductId: number;
  promotionId: number;
  promotionProductQuantity: number;
  promotionType: string;
  promotionMessage: string;
  expirationDate: string;
  activationDate: string;
}

export interface ISelectValue extends IBase {
  value: string;
  code: string;
  swatchText: string;
  path: string;
  displayOrder?: number;
  variantDisplayOrder?: number;
  variantImagePath?: string;
  variantSKU?: string;
  actionMode?: string;
}

export interface IPublishBundleProduct {
  associatedQuantity?: number;
  publishProductId?: number;
  attributes?: IBaseAttribute[];
  parentProductPublishId?: number;
  sku?: string;
  defaultWarehouseName?: string;
  quantity?: number;
  isObsolete?: boolean;
  parentBundleSku?: string;
  filteredAttributeList?: never | undefined;
  defaultInventoryCount?: number;
  name?: string;
}
export interface IProductAddOn {
  dontTrackInventory?: boolean;
  groupName?: string;
  displayType?: string;
  isAutoAddon?: boolean;
  isRequired?: boolean;
  inventoryMessage?: string;
  isOutOfStock?: boolean;
  addOnValues?: IProductAddOnValues[];
  autoAddonSKUs?: string;
  quantity?: number;
  displayOrder?: number;
  sku?: string;
  validationDetails?: ICartItemValidation[];
}

export interface IProductAddOnValues {
  publishProductId?: number;
  sku?: string;
  name?: string;
  isDefault?: boolean;
  attributes?: IBaseAttribute[];
  quantity?: number;
  retailPrice?: number;
  salesPrice?: number;
  allowBackOrdering?: boolean;
  dontTrackInventory?: boolean;
}

export interface IProductListRequest<T = string[]> {
  PageIndex: number;
  PageNumber: number;
  PageSize: number;
  CatalogId: number;
  CategoryId?: number;
  IsFacetList: boolean;
  LocaleId?: number;
  RefineBy?: Record<string, T>;
  Properties?: Record<string, string>;
  Keyword?: string;
  UseSuggestion?: boolean;
  PortalId?: number;
  Category?: string;
  IsProductInheritanceEnabled?: boolean;
  BrandCode?: string;
}

export interface IProductListDetails {
  productList: IProductList;
  facetList: IFacets[];
  isEnableCompare?: boolean;
}
export interface IProductList extends IBase {
  categoryCode?: string;
  subCategories?: ICategory[];
  productList: IProductListCard[];
  totalProducts: number;
  searchProfileId: number | null;
  totalCmsPages: number;
  pageNumber: number | null;
  pageSize: number | null;
  categoryName?: string;
  categoryTitle?: string;
  categoryId?: number;
  shortDescription?: string;
  longDescription?: string;
  loginToSeePricingAndInventory?: string;
  displayAllWarehousesStock?: string;
  sortList?: ISortingOptions[];
  pageList?: IPageList[];
  storeCode?: string;
  facetData?: IFacets[];
  globalAttributes?: IGlobalAttributeValues[];
}

export interface IProductPortalData {
  portalId: number;
  localeId?: number;
  publishCatalogId: number;
  portalProfileCatalogId?: number;
  imageSmallUrl?: string;
  globalAttributes?: IGlobalAttributeValues[];
  portalFeatureValues?: IPortalFeatureValues;
  profileId?: number;
  pageList?: IPageList[];
  storeCode?: string;
  catalogCode?: string;
  localeCode?: string;
  cultureCode?: string;
  sortList?: ISortingOptions[];
}

export interface IProductInventory {
  isDefaultWarehouse: boolean;
  warehouseName: string;
  quantity: number;
}

export interface IParameterProduct extends IBase {
  parentProductId?: string;
  selectedCodes?: string;
  selectedValues?: string;
  selectedCode?: string;
  selectedValue?: string;
  codes?: string;
  values?: string;
  sku?: string;
  parentProductSKU?: string;
  selectedAttributes?: { [key: string]: string } | undefined;
  publishCatalogId?: number;
  parentProductSku?: string;
  facetGroup?: string;
  fromSearch?: string;
  pageSize?: string;
  pageNumber?: string;
  localeId?: number;
  portalId?: number;
}

export interface IAttributesDetails extends IBase {
  attributeTypeName?: string;
  attributeCode?: string;
  isComparable?: string;
  attributeName?: string;
  attributeValues?: string;
  isConfigurable?: boolean;
  displayOrder?: number;
  selectValues?: ISelectValuesDetails[];
  isSwatch?: string;
  configurableAttribute?: IProductAttributes[];
  selectedAttributeValue?: string[];
  pimAttributeId?: number;
  isPersonalize?: boolean;
  pimAttributeFamilyId?: number;
  controlProperty?: IProperty;
  isRequired?: boolean;
  attributeValue?: string;
  attributeDefaultValue?: string;
  validationName?: string;
  controlName?: string;
  subValidationName?: string;
  validationValue?: string;
  isCustomField?: boolean;
  selectedCode?: string;
  isPersonalizable?: boolean;
  filteredAttributeList?: never;
  outOfStockOptions?: IOutOfStockOptions;
}

export interface IOutOfStockOptions {
  attributeCode?: string;
  attributeValues?: string;
  attributeName?: string;
  selectValues?: ISelectValuesDetails[];
}

export interface IParameterProduct extends IBase {
  parentProductId?: string;
  selectedCodes?: string;
  selectedValues?: string;
  selectedCode?: string;
  selectedValue?: string;
  codes?: string;
  values?: string;
  sku?: string;
  parentProductSKU?: string;
  selectedAttributes?: { [key: string]: string } | undefined;
  publishCatalogId?: number;
  facetGroup?: string;
  fromSearch?: string;
  pageSize?: string;
  pageNumber?: string;
  localeId?: number;
  portalId?: number;
}

export interface IQuery {
  sku: string;
  selectedCodes: string;
  selectedValues: string;
  parentProductSKU: string;
  selectedCode?: string;
  parentProductId?: string;
  selectedValue?: string;
  codes?: string;
  values?: string;
  parentProductSku: string;
  selectedAttributes?: { [key: string]: string } | undefined;
}

export interface IOutOfStockOptions {
  attributeCode?: string;
  attributeValues?: string;
  attributeName?: string;
  selectValues?: ISelectValuesDetails[];
}

export interface IOfferPricingProps {
  offerPricing: IOfferPrice[];
  productPrice: number;
  currencyCode?: "$";
  loginRequired?: boolean;
}

export interface IOfferPrice {
  price: number;
  quantity: number;
  maxQuantity?: number;
  minQuantity?: number;
}

export interface IProductHighlightProps {
  productId: number;
  highlights?: IProductHighlights[];
}
export interface IProductHighlights {
  highlightId?: number;
  highlightCode?: string;
  mediaPath?: string;
  hyperlink?: string;
  highlightName?: string;
  publishProductId?: number;
  displayPopup?: boolean;
  isActive?: boolean;
  displayOrder?: number;
  description?: string;
}

export interface IPriceProps {
  retailPrice: number;
  currencyCode?: string;
  salesPrice?: number;
  loginRequired?: boolean;
  isCallForPricing?: boolean;
  callForPricingMessage?: string;
  productList?: IGroupProductsDetails[] | IConfigurableProduct[];
  isObsolete?: boolean;
  unitOfMeasurement?: string | null;
  id: number;
}

export interface IAssociatedPublishedBundleProductModel {
  publishProductId: number;
  attribute: string;
  sku: string;
  inventoryMessage: string;
  showAddToCart: boolean;
  minQuantity?: number | null;
  maxQuantity?: number | null;
  allowBackOrder?: boolean | null;
  trackInventory?: boolean | null;
  productType: string;
  name: string;
  quantity?: number | null;
  reOrderLevel?: number | null;
  defaultWarehouseName: string;
  defaultInventoryCount: string;
  associatedQuantity?: number | null;
  inStockMessage: string;
  outOfStockMessage: string;
  backOrderMessage: string;
  imageThumbNailPath: string;
  parentPublishProductId: number;
  parentBundleSku: string;
}
export interface IInventory {
  warehouseName?: string;
  isDefaultWarehouse?: boolean;
  quantity: number;
  warehouseStateName?: string;
  warehousePostalCode?: string;
  warehouseCode?: string;
  warehouseCityName?: string;
  warehouseAddress?: string;
}
export interface IAllLocationInventory {
  productName?: string;
  defaultWarehouse: IInventory;
  inventory?: IInventory[];
}
export interface IProductListCard {
  inventory?: IProductInventory[];
  seoTitle: string;
  znodeCatalogId: number;
  productId: number;
  brandName: string;
  defaultWarehouseCount: number;
  isObsolete: boolean;
  productReviews?: IProductReview[];
  totalReviews?: number;
  rating?: number;
  znodeProductId?: number;
  allWarehousesStock: string;
  stockNotification: boolean;
  name: string;
  imageSmallPath: string;
  seoUrl?: string;
  publishProductId: number;
  sku: string;
  unitOfMeasurement: string;
  disablePurchasing: boolean;
  isDonTrackInventory: boolean;
  isConfigurableProduct: boolean;
  // configurableData: data.configurableData,
  attributes: IBaseAttribute[];
  allLocationQuantity: number;
  currencySuffix: string;
  productType: string;
  shouldShowViewDetails?: boolean;
  isCallForPricing?: boolean;
  discountAmount?: number;
  retailPrice?: number;
  salesPrice?: number;
  currencyCode: string;
  quantity?: number;
  promotions?: IPromotion[];
  highlightList: IHighlight[];
  globalAttributes?: IGlobalAttributeInformation;
  addOns: IProductAddOn[];
  categoryIds: number[];
  isAddToCartDisabled?: boolean;
  productPricingDetails?: IProductPricingDetailsResponse;
}
export interface IGlobalAttributeInformation {
  loginToSeePricingAndInventory: string;
  displayAllWarehousesStock: string;
}

export interface IStockNotificationRequest {
  parentSKU: string;
  productSKU: string;
  emailId: string;
  quantity: number;
  portalId?: number;
  catalogId?: number;
}

export interface IProductDisplayToggle {
  selectedMode: string;
  viewChange: (_icon: string) => void;
}

export interface IProductListFilterProps extends IProductDisplayToggle {
  productData: IProductList;
}

export interface IProductLayoutProps {
  product: IProductListCard;
  id: number;
  key?: string;
  globalAttributes?: { loginToSeePricingAndInventory: string; displayAllWarehousesStock?: string };
  showButton?: boolean;
  selectedMode?: string;
  displayReview?: boolean;
  displaySKU?: boolean;
  isEnableCompare?: boolean;
  showWishlist?: boolean;
  breadCrumbsDetails?: { breadCrumbsTitle: string; isCategoryFlow: boolean };
  isFromTypeaheadSearch?: boolean;
  handleClickOutside?: () => void;
}
export interface ICustomerReview {
  cmsCustomerReviewId?: number;
  productName: string;
  sku: string;
  portalId: number;
  storeName?: string;
  userId: number;
  userName: string;
  rating?: number;
  comments?: string;
  headline?: string;
  userLocation: string;
  publishProductId?: number;
  seoUrl?: string;
  createdDate: string;
}

export interface ICustomerReviewResponse extends IBase {
  errorCode?: number | undefined;
  errorMessage?: string | undefined;
  hasError?: boolean;
  customModelState?: { [key: string]: string } | undefined;
  errorDetailList?: { [key: string]: string } | undefined;
  pageIndex: number | undefined;
  pageSize: number | undefined;
  totalPages: number | undefined;
  totalResults: number | undefined;
  customerReviewList: IProductReview[] | undefined;
}

export interface IProductInventoryDetails {
  loginRequired?: boolean;
  productType: string;
  bundleProduct: IPublishBundleProductsDetails;
  bundleProductsData?: IPublishBundleProductsDetails[];
  stockNotification: boolean;
  childSku?: string;
  productUrl?: string;
  productInventoryMessage?: IProductInventoryMessage;
}
  
export interface IInventoryDetails {
  maxOrderQty: number;
  minOrderQty: number;
  allowBackOrdering: boolean;
  disablePurchasing: boolean;
  dontTrackInventory: boolean;
  inStockQty: number;
}

export interface IProductHighlightsSearchParams {
  highlightId: number;
  productId: number;
  highlightCode: string;
  productSeoUrl: string;
}
