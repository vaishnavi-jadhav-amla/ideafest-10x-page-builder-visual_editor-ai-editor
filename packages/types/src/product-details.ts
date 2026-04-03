import { Dispatch, SetStateAction } from "react";
import { IAttributeDetails, IBaseAttribute, ISelectValuesDetails, ITabData } from "./attribute";
import { IAttributesDetails, IHighlight, IParameterProduct, IProduct, IProductAddOn, IProductAddOnValues, IPromotion } from "./product";

import { IBase } from "./base";
import { IGeneralSetting } from "./general-setting";
import { IPersonalizedPayload } from "./cart";

export interface IBaseProductDetails extends IBase {
  name: string;
  sku: string;
  isObsolete?: boolean;
  quantity?: number;
  rating?: number;
  totalReviews?: number;
  imageLargePath?: string;
  longDescription?: string;
  defaultWarehouseName?: string;
  attributes?: IAttributeDetails[];
}

export interface IProductDetails extends IProductDetailsForMapping, IBaseProductDetails {
  frequentlyBought?: string;
  youMayAlsoLike?: string;
  znodeCatalogId: number;
  imageThumbNailPath?: string;
  productTemplateName?: string;
  currencySuffix: string;
  seoTitle: string;
  isSimpleProduct?: boolean;
  isLoginToSeePricing?: boolean;
  allLocationQuantity: number;
  productId: number;
  priceView?: boolean;
  minQuantity?: number;
  defaultWarehouseCount: number;
  allWarehousesStock: string;
  addOnProductSKUs?: ISelectedAddOn[];
  groupProductData?: IChildProductData[];
  configChildProductData?: IChildProductData[];
  configurableProductId?: number;
  selectedPersonalizeCodesAndValues?: { [key: string]: string };
  groupProductSKUs?: string;
  isBrandActive?: boolean;
  highlightList?: IHighlight[];
  defaultInventoryCount?: string;
  displayAllWarehousesStock?: boolean;
  stockNotification?: boolean;
  loginRequired?: boolean;
  isAddToCartOptionForProductSlidersEnabled?: boolean;
  enableAddToCartForSliders?: boolean;
  typicalLeadTime?: number;
  brandSeoUrl?: string;
  brandName?: string;
  maximumQuantity?: number;
  personaliseValuesList?: Record<string, string>;
  unitPrice?: number;
  externalId?: string;
  bundleProductSkus?: string;
  isCallForPricing?: boolean;
  isDisplayVariantsOnGrid?: boolean;
  isConfigurable?: boolean;
  isDefaultConfigurableProduct?: boolean;
  configurableData?: IConfigurableAttribute;
  productType?: string;
  promotionalPrice?: number;
  salesPrice?: number;
  backOrderMessage?: string;
  inStockMessage?: string;
  inventoryMessage?: string;
  showAddToCart?: boolean;
  tierPriceList?: ITierPrice[];
  minimumQuantity?: number;
  addOns?: IProductAddOn[];
  znodeCategoryIds?: number[];
  categoryId?: number;
  categoryName?: string;
  sEOTitle?: string;
  sKU?: string;
  retailPrice?: number;
  configurableProductSKU?: string;
  isLoginRequired?: boolean;
  seoDescription?: string;
  seoKeywords?: string;
  alternateImages?: IAlternateImages[];
  publishBundleProducts?: IPublishBundleProductsDetails[];
  isConfigurableProduct?: boolean;
  parentProductId?: number;
  configurableProductSkus?: string;
  personalisedCodes?: string;
  personalisedValues?: string;
  autoAddonSkus?: string;
  isRedirectToCart?: boolean;
  widgetProductId?: number;
  displayName?: string;
  products?: IProduct[];
  wishListId?: number;
  isAddedInWishList?: boolean;
  publishProductId?: number;
  parentPublishProductId?: number;
  groupProductDataSkus?: string;
  groupProductSkus?: unknown;
  groupProductsQuantity?: string;
  groupProducts?: IGroupProductsDetails[];
  configurableProductQuantity?: number;
  productReviews?: IProductReview[];
  configurableproductSku?: string;
  associatedAddOnProducts?: IAssociatedProduct[] | undefined;
  addOnQuantity?: number;
  shoppingCartItems?: unknown[];
  isActive?: boolean;
  shippingCost?: number | undefined;
  maxQty?: number;
  minQty?: number;
  allowBackOrdering?: boolean;
  dontTrackInventory?: boolean;
  disablePurchasing?: boolean;
  enableButtonOnCard?: boolean;
  inStockQty?: number;
  seoUrl?: string;
  cultureCode?: string;
  parentConfigurableProductName?: string;
  promotions?: IPromotion[];
  wishlistId?: number;
  currencyCode?: string;
  brandId?: number;
  znodeProductCategoryIds?: number[];
  imageSmallPath?: string;
  imageThumbnailPath?: string;
  parentProductImageSmallPath?: string;
  discountAmount?: number;
  znodeProductId?: number;
  imageSmallThumbnailPath?: string;
  imageMediumPath?: string;
  userWishListId?: number;
  productUrl?: string;
  filteredAttribute?: IFilteredAttributeList | undefined;
  addonGroupName?: string;
  dynamicAttribute?: IAttributeDetails[];
  outOfStockMessage?: string;
  trackInventory?: boolean;
  configurableProductSKUs?: string;
  globalProductMessage?: string;
  videoList?: IAttributeDetails[];
  groupProductList?: IGroupProductsDetails[];
  shouldShowViewDetails?: boolean;
  attributes: IAttributeDetails[];
  inventory?: IInventory[];
  sku: string;
  storeCode?: string;
  personalizeList?: { code: string; value: string }[];
  breadCrumbTitle?: string;
  isDownloadable?: boolean;
  storeName?: string;
  isCallForPricingPromotion?: boolean;
  replacementProductSuggestions?: string;
}
export interface IFilteredAttributeList {
  attributeList?: IBaseAttribute[];
  isPersonalizable?: IAttributeDetails;
  [key: string]: string | number | unknown | undefined;
}

export interface IConfigurableAttribute {
  configurableAttributes?: IAttributeDetails[];
  combinationErrorMessage?: string;
}

export interface IInventory {
  isDefaultWarehouse: boolean;
  warehouseName: string;
  quantity: number;
}
export interface IProductReview {
  formattedDate: string;
  userId?: number;
  publishProductId?: number;
  rating: number;
  cmsCustomerReviewId?: number;
  status?: string;
  userName: string;
  comments?: string;
  headline?: string;
  userLocation?: string;
  productName?: string;
  sku?: string;
  portalId?: number;
  createdDate: string;
  productReviewsCount?: number;
}

export interface IAlternateImages {
  imageLargePath?: string;
}

export interface IPublishBundleProductsDetails {
  associatedQuantity?: number;
  publishProductId?: number;
  attributes?: IAttributeDetails[];
  parentProductPublishId?: number;
  sku?: string;
  defaultWarehouseName?: string;
  quantity?: number;
  isObsolete?: boolean;
  parentBundleSku?: string;
  filteredAttributeList?: never | undefined;
  defaultInventoryCount?: number;
  name?: string;
  retailPrice?: number;
  salesPrice?: number;
  inStockQty?: number;
  outOfStockOption?: string;
  allowBackOrdering: boolean;
  isDontTrackInventory?: boolean;
  disablePurchasing: boolean;
  outOfStockMessage: string;
  inStockMessage: string;
  backOrderMessage: string;
  warehouseName: string;
  parentSku: string;
  imageThumbNailPath: string;
  typicalLeadTime: number;
  childProductType: string;
  bundleProductName: string;
  bundleProductQuantity: number;
  bundleProductSKU: string;
}

export interface ITierPrice {
  maxQuantity?: number;
  minQuantity?: number;
  quantity?: number;
  price?: number;
}

export interface ISelectedAddOn {
  groupName: string;
  sku: string;
}

export interface IGroupProductsDetails {
  publishProductId: number;
  name: string;
  retailPrice: number;
  sku: string;
  isObsolete?: boolean;
  attributes?: IAttributeDetails[];
  currencySuffix?: string;
  defaultInventoryCount?: string;
  defaultWarehouseName?: string;
  imageThumbNailPath?: string;
  quantity?: number;
  productName?: string;
  salesPrice?: number;
  currencyCode?: string;
}

export interface IAssociatedProduct {
  orderLineItemRelationshipTypeId?: number;
  quantity?: number;
  addOnQuantity?: number;
  sku?: string | undefined;
  addonGroupName?: string;
}

export interface IProductInventory {
  parentSKU: string;
  cartQty: number;
  cookieMappingId: number;
  childLineItems: IChildProductInventory[];
}

export interface IChildProductInventory {
  sku: string;
  qty: number;
}

interface IProductDetailsForMapping {
  version?: number;
  versionId?: number;
  parentProductAlternateImages?: string[];
  parentProductVideos?: string[];
  promotionId?: number;
  additionalCost?: number;
  ordersDiscount?: number;
  productPrice?: number;
  pimProductId?: number;
  categoryHierarchy?: null;
  cartParameter?: string;
}
export interface IAddonProps {
  addOnValueData: IProductAddOnValues;
  addOn: IProductAddOn;
  setAddOnCheckboxErrorShow: Dispatch<SetStateAction<boolean>>;
  setValidationMessage: Dispatch<SetStateAction<string>>;
  currencyCode: string;
  isLoginToSeePricing?: boolean;
}

export interface IConfigurableProduct {
  publishProductId: number;
  name: string;
  imageName: string;
  imageLargePath: string;
  productAttributes: IAttributesDetails[];
  alternateImageName: string;
  inStockMessage: string;
  outOfStockMessage: string;
  attributes: IAttributesDetails[];
  backOrderMessage: string;
  associatedProductDisplayOrder: number;
  sku: string;
  quantity: number;
  reOrderLevel: number;
  currencySuffix: string;
  salesPrice: number;
  retailPrice: number;
  allLocationQuantity: number;
  portalId: number;
  productId: number;
  obsoleteClass: string;
  minQuantity: string;
  inventoryMessage: string;
  showAddToCart: boolean;
  warehouseName: string;
  defaultInventoryCount: string;
  configurableAttributeCodeList: string[];
}

export interface IProductFetcher {
  productDetails: IProductDetailsProps;
  routePrams: { id: number; slug?: string };
  searchParams: IParameterProduct;
}
export interface IProductDetailsProps extends IBase {
  generalSettings: IGeneralSetting;
  product?: IProductDetails;
  productBasicDetails?: IProductDetails;
  configurableProducts?: IConfigurableProduct[];
  tabList?: ITabData[];
  searchParams?: string;
  routePrams?: { id: number; slug?: string };
  portalId?: number;
}

export interface ISkuDetailsParams {
  sku: string | undefined;
  quantity?: number | undefined;
  addOnSkuListModel?: IAddOnSkuListModel[];
  personalizedDetails?: IPersonalizedPayload[];
  productType: string;
  addToCartChildItems: IAddToCartChildItems[];
  customData: string[];
  groupCode: string;
  additionalCost: [];
}

export interface IAddOnSkuListModel {
  sku: string | undefined;
}

export interface IAddToCartChildItems {
  sku: string | undefined;
  quantity: number | undefined;
  addOnSkuListModel?: ISelectedAddOn[];
  personalizedDetails?: IPersonalizedPayload[];
  customData?: [];
  additionalCost?: [];
}

export interface IChildProductData {
  addOnProductSKUs?: ISelectedAddOn[];
  personalizeList?: IPersonalizedPayload[];
  sku: string;
  quantity: number;
  inStockQty: number;
  productId: number;
  isValid?: boolean;
}
export interface IProductInventoryInformation {
  productName?: string;
  productType?: string;
  inStockQuantity: number;
  productId: number;
  sku: string;
  allowBackOrdering: boolean;
  disablePurchasing: boolean;
  retailPrice: number | undefined;
  customClass?: string;
  isObsolete?: boolean;
  bundleProductsData?: IPublishBundleProductsDetails[];
  stockNotification?: boolean;
  childProductSku?: string;
  isShow?: true;
  productUrl?: string;
  productInventoryMessage?: IProductInventoryMessage;
  publishProductId?: number;
}

export interface IProductInventoryInformation {
  inStockQuantity: number;
  sku: string;
  allowBackOrdering: boolean;
  disablePurchasing: boolean;
  retailPrice: number | undefined;
  productType?: string;
  productId: number;
  customClass?: string;
  isObsolete?: boolean;
  bundleProductsData?: IPublishBundleProductsDetails[];
  stockNotification?: boolean;
  childProductSku?: string;
  isShow?: true;
  productUrl?: string;
  productInventoryMessage?: IProductInventoryMessage;
}
export interface IProductInventoryMessage {
  inStockMessage: string;
  outOfStockMessage?: string;
  backOrderMessage: string;
}

export interface IProductInventoryProps {
  loginRequired?: boolean;
  retailPrice?: number;
  isObsolete?: boolean;
  disablePurchasing?: boolean;
  allowBackOrdering?: boolean;
  inStockQty?: number | undefined;
  stockNotification?: boolean;
  sku?: string;
  productUrl?: string;
  productType?: string;
  productInventoryMessage?: IProductInventoryMessage;
  publishProductId?: number;
}

export interface IRecentlyViewedSkuProductList {
  sku: string;
  publishProductId: number;
}
export interface IBundleAttributes {
  attributeCode: string;
  attributeValues: string;
  selectValues: ISelectValuesDetails[];
}

export interface IBundleProductDetails {
  isObsolete: boolean;
  publishProductId: number;
  attributes: IBundleAttributes[];
  associatedQuantity?: number;
  imageThumbNailPath: string;
  defaultWarehouseName?: string;
  defaultInventoryCount?: number;
  quantity?: number;
  retailPrice?: number;
  outOfStockOption: string;
  inStockQty: number;
  name: string;
  sku: string;
  typicalLeadTime: number;
  childProductType: string;
  parentBundleSku: string;
  bundleProductName: string;
  bundleProductSKU: string;
  bundleProductQuantity: number;
  allowBackOrdering: boolean;
  disablePurchasing: boolean;
  outOfStockMessage: string;
  inStockMessage: string;
  backOrderMessage: string;
  warehouseName: string;
  parentSku: string;
}

export interface IBundleProductProps {
  bundleProducts: IBundleProductDetails[];
  productType: string | undefined;
  isParentObsolete: boolean | undefined;
  loginRequired: boolean | undefined;
  stockNotification?: boolean;
  productUrl?: string;
  productInventoryMessage?: IProductInventoryMessage;
}

export interface IBundleInventory {
  childBundleItems: IPublishBundleProductsDetails[] | undefined;
  retailPrice?: number;
  publishProductId?: number;
  productInventoryMessage?: IProductInventoryMessage;
}
export interface IQueryParams {
  parentProductId?: string;
  codes?: string;
  values?: string;
  parentProductSKU?: string;
  sku?: string;
  selectedCodes?: string;
  selectedValues?: string;
}

export interface IBundleProductsOutOfStockOption {
  sku: string;
  outOfStockOptions: string;
  defaultInventoryCount: number;
  associatedQuantity: number;
}

export interface ICompareProduct {
  productId: number;
  sku?: string;
  name?: string;
  attributes?: IAttributeDetails[];
  image?: string;
  retailPrice: number | null;
  rating?: number | null;
  salesPrice: number | null;
  isShowViewDetails?: boolean;
  isCallForPricing?: boolean;
  znodeCatalogId?: number;
  currencySuffix?: string;
  seoTitle?: string;
  allLocationQuantity?: number;
  defaultWarehouseCount?: number;
  allWarehousesStock?: string;
  variantDescription?: string;
  quantity?: number;
  [key: string]: string | number | boolean | null | undefined | IAttributeDetails[];
}
