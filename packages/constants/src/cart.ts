
const CART_PORTAL_FLAGS = {
  SHOW_PROMOTION_SECTION: "ShowPromotionSection",
  LOGIN_TO_SEE_PRICING_INVENTORY: "LoginToSeePricingAndInventory",
  IS_QUOTE_REQUEST: "EnableQuoteRequest",
  SHOW_ESTIMATE_SHIPPING_COST: "ShowEstimateShippingCost",
  UNITED_STATES_SUFFIX: "USD",
  LOGIN_REQUIRED:"LoginRequired"
};

const ORDER_ORIGIN = {
  WEBSTORE_ORDER_ORIGIN: "Webstore",
};

const CUSTOM_HEADERS = {
  ZNODE_USER_ID: "Znode-UserId",
  ZNODE_PROFILE_ID: "Znode-ProfileId",
  ACCEPT: "Accept",
  CONTENT_TYPE: "Content-Type",
  APPLICATION_JSON: "application/json-patch+json",
  TEXT_PLAIN: "text/plain",
  AUTHORIZATION: "Authorization",
  CACHE_CONTROL: "Cache-Control",
  NO_STORE: "no-store",
  ZNODE_PRIVATE_KEY: "Znode-PrivateKey",
  PUBLISH_STATE: "Znode-PublishState",
  DOMAIN_NAME: "Znode-DomainName",
  ZNODE_LOCALE_ID: "Znode-Locale",
  LOCALE_CODE: "Znode-LocaleCode",
  PORTAL_CODE: "Znode-PortalCode",
  PUBLISH_CODE: "Znode-PublishState",
};

const SAVE_FOR_LATER = {
  SAVE_FOR_LATER_ID: "SaveForLaterId",
};

const VALIDATION_ERROR = {
  ERROR_OUT_OF_STOCK: 259,
};

export { CUSTOM_HEADERS, CART_PORTAL_FLAGS, SAVE_FOR_LATER, ORDER_ORIGIN, VALIDATION_ERROR };
