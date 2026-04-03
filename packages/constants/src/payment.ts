const PAYMENT = {
  CARD_CONNECT: "cardconnect",
  BRAINTREE: "braintree",
  AUTHORIZENET: "authorizenet",
  PAYPAL_EXPRESS: "paypalexpress",
  AMAZON_PAY: "Amazon_Pay",
  AMAZON_PAY_HOSTED: "AMAZON_V2",
  FILTER_FOR_OFFLINE_PAYMENT: "isUsedForOfflinePayment",
  PORTAL_ID: "PortalId",
  IS_ASSOCIATED: "IsAssociated",
  PLEASE_ADD_SAVE_BILLING_ADDRESS: "PleaseAddSaveBillingAddress",
  ONE_TIME_ADDRESS_IDS: "OneTimeAddressIds",
  VISA: "VISA",
  PAYMENT_ACCOUNT_KEY: "PaymentModelKey",
  UNITED_STATES_SUFFIX: "USD",
  COD: "COD",
  ACH: "ach",
  DOCUMENT_MAX_FILE_SIZE: 5242880,
};

const PAYMENT_SUBTYPE = {
  INVOICE_ME: "InvoiceMe",
  PURCHASE_ORDER: "PO",
  CHARGE_ON_DELIVERY: "COD",
  CREDIT_CARD: "CreditCard",
  ACH: "ACH",
};

const PAYMENT_STATUS = {
  CAPTURED: "CAPTURED",
  AUTHORIZED: "AUTHORIZED",
  PENDING: "PENDING",
  DECLINED: "DECLINED",
  FAILED: "FAILED",
  VERIFIED: "VERIFIED",
  "VOIDED": "VOIDED",
};

const SPREEDLY_RESPONSE_CODE = {
  DECLINED: "2",
};
const PAYMENT_PLUGIN = {
  SPREEDLY: "SPREEDLY",
  PAYMENT_PLUGIN_SUFFIX: "Component",
};

const PLUGIN_TYPE = {
  PAYMENT: "Payment",
};

const CONFIGURATION_FIELDS = {
  SUBTYPE: "SubType",
  ENABLE_PO_DOCUMENT_UPLOAD: "EnablePODocumentUpload",
  CREDIT_CARD_AUTHORIZATION: "CreditCardAuthorization",
  ENABLE_OAB: "EnableOAB",
  IS_PO_DOCUMENT_UPLOAD_REQUIRED: "IsPODocumentUploadRequired",
  IS_BILLING_ADDRESS_OPTIONAL: "HideBillingAddress",
  SELECT_PAYMENT_SETTING: "SelectPaymentSetting"
};

const PLUGIN_SCOPE = {
  STORE: "Store",
  GLOBAL: "Global",
};

const PAYMENT_TRANSACTION_STATUS = {
  SETTLED: "Settled",
  NON_SETTLED: "NonSettled",
  SUCCEEDED: "succeeded",
  SUBMITTED_FOR_SETTLEMENT: "SUBMITTED_FOR_SETTLEMENT"
};

const PAYMENT_TRANSACTION_TYPE = {
  CAPTURED: "Capture",
  PURCHASE: "Purchase",
  SALE: "SALE"
};

const FILE_FORMATS = ["png", "jpg", "jpeg", "pdf", "doc", "docx", "ppt", "xls", "zip", "ttf", "xlsx", "odt", "csv", "txt", "zip"];

const PAYMENT_SETTING = {
  VERIFY_ONLY: "VerifyOnly",
  VERIFY_AND_AUTHORIZE: "VerifyAndAuthorize",
  VERIFY_AUTHORIZE_AND_CAPTURE: "VerifyAuthorizeAndCapture",
  AUTHORIZE_AND_CAPTURE: "AuthorizeAndCapture",
  AUTHORIZE_ONLY: "AuthorizeOnly"
};

export { PAYMENT, PAYMENT_SUBTYPE, PLUGIN_TYPE, PAYMENT_STATUS, PAYMENT_PLUGIN, FILE_FORMATS, PLUGIN_SCOPE, CONFIGURATION_FIELDS, SPREEDLY_RESPONSE_CODE, PAYMENT_TRANSACTION_STATUS, PAYMENT_TRANSACTION_TYPE, PAYMENT_SETTING };