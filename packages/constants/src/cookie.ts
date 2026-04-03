const CART_COOKIE = {
  DEFAULT_CART_ID: "00000000-0000-0000-0000-000000000000",
  CART_ID: "CartId",
  CART_NUMBER: "CartNumber",
  COPIED_CART_NUMBER: "CopiedCartNumber",
};

const SESSION_COOKIE = {
  CALLBACK_URL: "next-auth.callback-url",
  CSRF_TOKEN: "next-auth.csrf-token",
  SESSION_TOKEN: "next-auth.session-token",
};

const REMEMBER_ME_COOKIE = {
  COOKIE_KEY: "LoginRememberMeEMail",
  COOKIE_EXP: 365,
};

const MULTI_FACTOR_AUTHENTICATION = {
  OTP_SENT_FLAG: "OTPSentNotificationFlag",
};

export { CART_COOKIE, SESSION_COOKIE, REMEMBER_ME_COOKIE, MULTI_FACTOR_AUTHENTICATION };
