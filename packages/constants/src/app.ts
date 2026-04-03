// Environment Configuration
const APP = {
  BASE_URL: process.env.API_URL,
  WEBSTORE_DOMAIN_NAME: process.env.WEBSTORE_DOMAIN_NAME,
  SESSION_TIMEOUT: 60 * 60,
  DEFAULT_LOCALE: "en-US",
  MAXIMUM_FRACTION_DIGITS: 2,
  SECRET_KEY: "SecretKey",
};
const AUTH_PATHS = ["/signup", "/reset-password", "/forgot-password", "/login"];

export const GENERAL_SETTINGS = {
  DATE_FORMAT: "MM/DD/YY",
  TIME_ZONE: "hh:mm A",
  DEFAULT_TIME_ZONE: Intl.DateTimeFormat().resolvedOptions().timeZone,
  PRICE_ROUND_OFF: 2,
};
export const APP_NAME = {
  WEBSTORE: "WEBSTORE",
  PAGE_BUILDER: "PAGE_BUILDER",
};

export const REG_EX = {
  Email: /^[a-zA-Z0-9]{1,100}(?:[._+%-][a-zA-Z0-9]{1,100})*@(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,}$/,
  Password: /^(?!.*[{}])(?=.*\d)(?=.*[a-zA-Z]).{8,}$/,
  AlphaNumericCharacter: /^[a-zA-Z0-9]*$/,
  OnlyNumberAllowed: /^[0-9]+$/,
};

export const WEBSTORE_ROUTES = {
  ADMIN_RESTRICTED_PATHS: {
    WEBSTORE: ["/account/account-users", "/account/account-orders", "/account/account-information"],
    API: ["/api/account/account-users", "/api/account/account-orders", "/api/account/account-information"],
  },
};

export const AUTH_ROUTES = [...AUTH_PATHS];
export const EXCLUDED_PATHS = [...AUTH_PATHS, "/validate-impersonation-session"];

export const GLOBAL_SETTING_CODES = {
  USER_ACTIVITY: {
    GROUP_CODE: "UserActivityLog",
    SETTING_CODE: "EnableUserActivityLogging",
  },
};

export { APP };
