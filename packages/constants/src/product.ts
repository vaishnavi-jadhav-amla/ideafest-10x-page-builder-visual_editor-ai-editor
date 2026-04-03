// Constants related to product types, attributes, and messages
const PRODUCT = {
  OUT_OF_STOCK_OPTIONS: "OutOfStockOptions",
  DISABLE_PURCHASING: "DisablePurchasing",
  DONT_TRACK_INVENTORY: "DontTrackInventory",
  MAXIMUM_QUANTITY: "MaximumQuantity",
  MINIMUM_QUANTITY: "MinimumQuantity",
  ADD_ON_ERROR: "Error occurred in the AddOn",
  PLACEHOLDER: "placeholder",
  HIGHLIGHTS: "Highlights",
  DisablePurchasing: "DisablePurchasing",
  ZNODE_CATALOG_ID: "ZnodeCatalogId",
  PRODUCT_TYPE: "ProductType",
  UOM: "UOM",
  IS_ACTIVE: "IsActive",
  IS_OBSOLETE: "IsObsolete",
  OBSOLETE_VALIDATION_KEY: "Obsolete",
  PRICE_NOT_SET_VALIDATION_KEY: "PriceNotSet",
  CATEGORY_TITLE: "CategoryTitle",
  SHORT_DESCRIPTION: "ShortDescription",
  LONG_DESCRIPTION: "LongDescription",
  CALL_FOR_PRICING: "CallForPricing",
  CALL_FOR_PRICING_MESSAGE: "Call For Pricing.",
  LOGIN_TO_SEE_PRICING_AND_INVENTORY: "LoginToSeePricingAndInventory",
  DISPLAY_ALL_WAREHOUSES_STOCK: "DisplayAllWarehousesStock",
  BRAND: "Brand",
  DISPLAY_ALL_WAREHOUSE_STOCK: "DisplayAllWarehousesStock",
  ENABLE_INVENTORY_STOCK_NOTIFICATION: "EnableInventoryStockNotification",
  TYPICAL_LEAD_TIME: "TypicalLeadTime",
  GLOBAL_PRODUCT_MESSAGE: "GlobalProductMessage",
  VIDEO: "Video",
  PRODUCT_NAME: "ProductName",
  SKU: "SKU",
  QTY: "Qty",
  TRUE_VALUE: "true",
  IS_OBSOLETE_MESSAGE: "ObsoleteMessage",
  PRICE_NOT_SET: "PriceNotSetMessage",
  PRODUCT_COMBINATION_ERROR_MESSAGE: "productCombinationErrorMessage",
  PRODUCT_SPECIFICATION: "Product Specification",
  SHIPPING_INFORMATION: "Shipping Information",
  LONG_DESCRIPTION_TITLE: "Long Description",
  REVIEWS: "Reviews",
  IS_PERSONALIZE: "IsPersonalizable",
  IS_REQUIRED: "IsRequired",
  LABEL: "Label",
  EXTENSIONS: "Extensions",
  ADDITIONAL_INFORMATION: "additionalInformation",
  ADDITIONAL_INFO: "ProductImage,CallForPricing,UOM,ProductType",
  IS_DOWNLOADABLE: "IsDownloadable",
  MAX_COMPARE_PRODUCT_LIMIT: 4,
};

const PRODUCT_TYPE = {
  CONFIGURABLE_PRODUCT_LABEL: "Configurable Product",
  CONFIGURABLE_PRODUCT: "ConfigurableProduct",
  SIMPLE_PRODUCT: "SimpleProduct",
  BUNDLE_PRODUCT: "BundleProduct",
  GROUPED_PRODUCT: "GroupedProduct",
  GROUPED_PRODUCT_LABEL: "Grouped Product",
  SIMPLE_PRODUCT_LABEL: "Simple Product",
  BUNDLE_PRODUCT_LABEL: "Bundle Product",
};

const INVENTORY = {
  DONT_TRACK_INVENTORY: "DontTrackInventory",
  DISABLE_PURCHASING: "DisablePurchasing",
  ALLOW_BACK_ORDERING: "AllowBackOrdering",
  TEXT_IN_STOCK: "In Stock",
  TEXT_OUT_OF_STOCK_ADDON: "Out of Stock Addon",
  TEXT_BACK_ORDER_MESSAGE: "Backorder Available",
  WARNING_SELECTED_QUANTITY: "Warning: Selected quantity",
  DISPLAY_VARIANTS_ON_GRID: "DisplayVariantsOnGrid",
  CALL_FOR_PRICING: "CallForPricing",
  ERROR_ADD_ON_PRICE: "Error: Add-On Price Unavailable",
  ERROR_PRICE_NOT_ASSOCIATE: "Error: Price Not Associated",
  BACK_ORDER_MESSAGE: "BackOrderMessage",
  IN_STOCK_MESSAGE: "InStockMessage",
  IN_STOCK_MESSAGE_WITH_QTY: "InStockMessageWithQty",
  STOCK_NOTIFICATION_MESSAGE: "StockNotificationMessage",
};

const PRODUCT_REVIEW = {
  NEWEST_FIRST: "NF",
  OLDEST_FIRST: "OF",
  HIGHEST_RATING_FIRST: "HRF",
  LOWEST_RATING_FIRST: "LRF",
};

const OUT_OF_OPTION = {
  ALLOW_BACK_ORDERING: "AllowBackOrdering",
  DONT_TRACK_INVENTORY: "DontTrackInventory",
  DISABLE_PURCHASING: "DisablePurchasing",
};

const PRODUCT_INVENTORY_INVALID_CODE = [259];
const PRODUCT_ADD_TO_CART_INVALID_CODE = [272, 263, 260, 262, 261, 269, 272, 338, 259];

export { PRODUCT, PRODUCT_TYPE, INVENTORY, PRODUCT_REVIEW, PRODUCT_INVENTORY_INVALID_CODE, PRODUCT_ADD_TO_CART_INVALID_CODE, OUT_OF_OPTION };
