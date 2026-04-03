const CACHE_KEYS = {
  PUBLISH_CATEGORY_LIST: "PublishCategoryList_",
  PRODUCT_LIST_KEY: "ProductListKey_",
  BRAND_LIST_KEY: "BrandListKey",
  DOMAIN_LIST: "Domainlist",
  PORTAL: "Portal",
  WEBSTORE_PORTAL: "WebstorePortal",
  USER_ADDRESSES: "UserAddresses",
  GET_PUBLISH_CATEGORY: "GetPublishCategory",
  HIGHLIGHT_DETAIL_BY_CODE: "HighLightDetailByCode",
  WEBSTORE_LOCATOR_LIST: "WebstoreLocatorList",
  GET_PORTAL_APPROVAL_DETAILS_BY_ID: "GetPortalApprovalDetailsById",
  PUBLISH_PRODUCT: "Product",
  PORTAL_: "Portal_",
  CATALOG: "Catalog",
  CATEGORY: "Category",
  CONTAINER_KEY: "ContainerKey",
  BRAND_CODE: "BrandCode",
  SLIDER_KEY: "BannerSliderKey",
  DYNAMIC_TAG: "DynamicTag",
  CONTENT_PAGE: "ContentPage",
  LINK_PRODUCT: "LinkProduct",
  PAGE_MAPPING: "Page",
};

const EVENT_NAME = {
  PortalPublishEvent: "PortalPublishEvent",
  PortalUpdateEvent: "PortalUpdateEvent",
  VisualEditorPublishEvent: "VisualEditorPublishEvent",
  CategoryPublishEvent: "CategoryPublishEvent",
  ProductPublishEvent: "ProductPublishEvent",
  CatalogPublishEvent: "CatalogPublishEvent",
  BannerSliderPublishEvent: "BannerSliderPublishEvent",
  ContentContainerPublishEvent: "ContentContainerPublishEvent",
  CustomerReviewUpdateEvent: "CustomerReviewUpdateEvent",
  ProductInventoryUpdateEvent: "ProductInventoryUpdateEvent",
  ProductPriceUpdateEvent: "ProductPriceUpdateEvent",
  ManuallyRefreshWebStoreCacheEvent: "ManuallyRefreshWebStoreCacheEvent"
};

export { CACHE_KEYS, EVENT_NAME };